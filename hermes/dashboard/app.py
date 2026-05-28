"""FastAPI dashboard. Run with: uvicorn hermes.dashboard.app:app --reload"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse

from .. import config as cfg_mod
from .. import db

app = FastAPI(title="Hermes Dashboard", version="0.1.0")

TEMPLATE = Path(__file__).resolve().parent / "templates" / "index.html"


def _get_conn() -> sqlite3.Connection:
    cfg = cfg_mod.load()
    db.init(cfg.db_path)
    conn = sqlite3.connect(cfg.db_path)
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/", response_class=HTMLResponse)
def index():
    return TEMPLATE.read_text()


@app.get("/api/mentions")
def api_mentions(limit: int = 50):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT id, platform, author, text, url, matched_keywords, seen_at "
            "FROM mentions ORDER BY seen_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [
            {**dict(r), "matched_keywords": json.loads(r["matched_keywords"])}
            for r in rows
        ]
    finally:
        conn.close()


@app.get("/api/drafts")
def api_drafts(status: str | None = None, limit: int = 50):
    conn = _get_conn()
    try:
        if status:
            rows = conn.execute(
                "SELECT id, topic, platform, body, status, created_at "
                "FROM drafts WHERE status=? ORDER BY created_at DESC LIMIT ?",
                (status, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, topic, platform, body, status, created_at "
                "FROM drafts ORDER BY created_at DESC LIMIT ?", (limit,)
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.post("/api/drafts/{draft_id}/approve")
def approve_draft(draft_id: int):
    conn = _get_conn()
    try:
        conn.execute("UPDATE drafts SET status='approved' WHERE id=?", (draft_id,))
        conn.commit()
        return {"ok": True, "draft_id": draft_id, "status": "approved"}
    finally:
        conn.close()


@app.post("/api/drafts/{draft_id}/reject")
def reject_draft(draft_id: int):
    conn = _get_conn()
    try:
        conn.execute("UPDATE drafts SET status='rejected' WHERE id=?", (draft_id,))
        conn.commit()
        return {"ok": True, "draft_id": draft_id, "status": "rejected"}
    finally:
        conn.close()


@app.get("/api/posts")
def api_posts(limit: int = 50):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT id, draft_id, platform, external_id, url, body, dry_run, "
            "posted_at, error FROM posts ORDER BY posted_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/runs")
def api_runs(limit: int = 30):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT id, job, started_at, finished_at, ok, detail "
            "FROM runs ORDER BY started_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
