"""SQLite schema + thin helpers. Append-only mentality; no destructive updates."""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator

SCHEMA = """
CREATE TABLE IF NOT EXISTS mentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    author TEXT,
    text TEXT NOT NULL,
    url TEXT,
    matched_keywords TEXT NOT NULL,
    raw_json TEXT NOT NULL,
    seen_at TEXT NOT NULL,
    UNIQUE(platform, external_id)
);
CREATE INDEX IF NOT EXISTS idx_mentions_seen_at ON mentions(seen_at DESC);

CREATE TABLE IF NOT EXISTS drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    platform TEXT NOT NULL,
    body TEXT NOT NULL,
    source_signals TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    reviewer_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON drafts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draft_id INTEGER REFERENCES drafts(id),
    platform TEXT NOT NULL,
    external_id TEXT,
    url TEXT,
    body TEXT NOT NULL,
    dry_run INTEGER NOT NULL,
    posted_at TEXT NOT NULL,
    error TEXT
);
CREATE INDEX IF NOT EXISTS idx_posts_posted_at ON posts(posted_at DESC);

CREATE TABLE IF NOT EXISTS runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job TEXT NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    ok INTEGER,
    detail TEXT
);
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def connect(db_path: Path) -> Iterator[sqlite3.Connection]:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init(db_path: Path) -> None:
    with connect(db_path) as conn:
        conn.executescript(SCHEMA)


def insert_mention(conn: sqlite3.Connection, *, platform: str, external_id: str,
                   author: str | None, text: str, url: str | None,
                   matched_keywords: list[str], raw: dict) -> int | None:
    try:
        cur = conn.execute(
            "INSERT INTO mentions(platform, external_id, author, text, url, "
            "matched_keywords, raw_json, seen_at) VALUES(?,?,?,?,?,?,?,?)",
            (platform, external_id, author, text, url,
             json.dumps(matched_keywords), json.dumps(raw), now_iso()),
        )
        return cur.lastrowid
    except sqlite3.IntegrityError:
        return None


def insert_draft(conn: sqlite3.Connection, *, topic: str, platform: str,
                 body: str, source_signals: dict) -> int:
    cur = conn.execute(
        "INSERT INTO drafts(topic, platform, body, source_signals, created_at) "
        "VALUES(?,?,?,?,?)",
        (topic, platform, body, json.dumps(source_signals), now_iso()),
    )
    return cur.lastrowid


def insert_post(conn: sqlite3.Connection, *, draft_id: int | None, platform: str,
                external_id: str | None, url: str | None, body: str,
                dry_run: bool, error: str | None = None) -> int:
    cur = conn.execute(
        "INSERT INTO posts(draft_id, platform, external_id, url, body, dry_run, "
        "posted_at, error) VALUES(?,?,?,?,?,?,?,?)",
        (draft_id, platform, external_id, url, body, 1 if dry_run else 0,
         now_iso(), error),
    )
    return cur.lastrowid


def start_run(conn: sqlite3.Connection, job: str) -> int:
    cur = conn.execute(
        "INSERT INTO runs(job, started_at) VALUES(?,?)", (job, now_iso())
    )
    return cur.lastrowid


def finish_run(conn: sqlite3.Connection, run_id: int, ok: bool, detail: str = "") -> None:
    conn.execute(
        "UPDATE runs SET finished_at=?, ok=?, detail=? WHERE id=?",
        (now_iso(), 1 if ok else 0, detail, run_id),
    )
