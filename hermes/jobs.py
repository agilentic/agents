"""Scheduled jobs: poll mentions, draft posts, publish approved. Wired by cron.py."""
from __future__ import annotations

import json
import logging
from pathlib import Path

from . import config as cfg_mod
from . import db
from .articles import Drafter, collect_trend_signals
from .mentions import MentionsSource
from .mentions.fixture_source import FixtureSource
from .mentions.linkedin_source import LinkedInManualSource
from .mentions.x_source import XSource
from .publisher import Publisher
from .publisher.instagram_publisher import InstagramPublisher
from .publisher.linkedin_publisher import LinkedInPublisher
from .publisher.x_publisher import XPublisher

log = logging.getLogger("hermes.jobs")

_PKG = Path(__file__).resolve().parent


def _jsonl_append(path: Path, obj: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a") as f:
        f.write(json.dumps(obj) + "\n")


def build_sources(cfg) -> list[MentionsSource]:
    sources: list[MentionsSource] = []
    if cfg.x_bearer_token:
        sources.append(XSource(cfg.x_bearer_token))
    else:
        fixture = _PKG / "tests" / "fixtures" / "sample_mentions.json"
        if fixture.exists():
            sources.append(FixtureSource(platform="x", fixture_path=fixture))
    sources.append(LinkedInManualSource(_PKG / "manual_inbox.jsonl"))
    return sources


def build_publishers(cfg) -> list[Publisher]:
    return [
        XPublisher(api_key=cfg.x_api_key, api_secret=cfg.x_api_secret,
                   access_token=cfg.x_access_token, access_secret=cfg.x_access_secret,
                   dry_run=cfg.dry_run),
        LinkedInPublisher(access_token=cfg.linkedin_access_token,
                          actor_urn=cfg.linkedin_actor_urn, dry_run=cfg.dry_run),
        InstagramPublisher(access_token=cfg.ig_access_token,
                           ig_user_id=cfg.ig_user_id, dry_run=cfg.dry_run),
    ]


def poll_mentions_job() -> dict:
    cfg = cfg_mod.load()
    db.init(cfg.db_path)
    new_count = 0
    with db.connect(cfg.db_path) as conn:
        run_id = db.start_run(conn, "poll_mentions")
        try:
            for source in build_sources(cfg):
                for m in source.fetch(cfg.keywords):
                    rid = db.insert_mention(
                        conn, platform=m.platform, external_id=m.external_id,
                        author=m.author, text=m.text, url=m.url,
                        matched_keywords=list(m.matched_keywords), raw=m.raw,
                    )
                    if rid is not None:
                        new_count += 1
                        _jsonl_append(cfg.log_dir / "mentions.jsonl", {
                            "id": rid, "platform": m.platform,
                            "external_id": m.external_id, "author": m.author,
                            "text": m.text, "url": m.url,
                            "matched_keywords": list(m.matched_keywords),
                        })
            db.finish_run(conn, run_id, ok=True, detail=f"{new_count} new")
        except Exception as e:
            db.finish_run(conn, run_id, ok=False, detail=str(e))
            log.exception("poll_mentions failed")
            raise
    return {"new": new_count}


def draft_posts_job(*, platforms: tuple[str, ...] = ("x", "linkedin")) -> dict:
    cfg = cfg_mod.load()
    db.init(cfg.db_path)
    drafter = Drafter(provider=cfg.llm_provider, api_key=cfg.llm_api_key,
                      model=cfg.llm_model)
    drafts_made = 0
    with db.connect(cfg.db_path) as conn:
        run_id = db.start_run(conn, "draft_posts")
        try:
            signals = collect_trend_signals(conn, hours=24)
            if not signals:
                db.finish_run(conn, run_id, ok=True, detail="no signals")
                return {"drafts": 0, "reason": "no signals"}
            top = signals[0]
            for platform in platforms:
                draft = drafter.draft(signal=top, platform=platform)
                draft_id = db.insert_draft(
                    conn, topic=draft.topic, platform=platform, body=draft.body,
                    source_signals={"keyword": top.keyword, "count": top.count,
                                    "samples": top.samples},
                )
                drafts_made += 1
                _jsonl_append(cfg.log_dir / "drafts.jsonl", {
                    "id": draft_id, "topic": draft.topic, "platform": platform,
                    "body": draft.body,
                })
            db.finish_run(conn, run_id, ok=True, detail=f"{drafts_made} drafts")
        except Exception as e:
            db.finish_run(conn, run_id, ok=False, detail=str(e))
            log.exception("draft_posts failed")
            raise
    return {"drafts": drafts_made}


def publish_approved_job() -> dict:
    """Publish drafts marked status='approved'. Honors dry_run from config."""
    cfg = cfg_mod.load()
    db.init(cfg.db_path)
    publishers = {p.platform: p for p in build_publishers(cfg)}
    posted = 0
    with db.connect(cfg.db_path) as conn:
        run_id = db.start_run(conn, "publish_approved")
        try:
            rows = conn.execute(
                "SELECT id, platform, body FROM drafts WHERE status='approved'"
            ).fetchall()
            for row in rows:
                pub = publishers.get(row["platform"])
                if pub is None:
                    continue
                result = pub.publish(row["body"])
                db.insert_post(
                    conn, draft_id=row["id"], platform=row["platform"],
                    external_id=result.external_id, url=result.url,
                    body=row["body"], dry_run=result.dry_run, error=result.error,
                )
                if result.ok:
                    new_status = "posted_dry_run" if result.dry_run else "posted"
                    conn.execute(
                        "UPDATE drafts SET status=?, reviewed_at=datetime('now') "
                        "WHERE id=?", (new_status, row["id"]),
                    )
                    posted += 1
                _jsonl_append(cfg.log_dir / "posts.jsonl", {
                    "draft_id": row["id"], "platform": row["platform"],
                    "dry_run": result.dry_run, "ok": result.ok,
                    "error": result.error, "external_id": result.external_id,
                })
            db.finish_run(conn, run_id, ok=True, detail=f"{posted} posted")
        except Exception as e:
            db.finish_run(conn, run_id, ok=False, detail=str(e))
            log.exception("publish_approved failed")
            raise
    return {"posted": posted, "dry_run": cfg.dry_run}
