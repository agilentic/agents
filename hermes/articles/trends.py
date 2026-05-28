"""Trend-signal collector: per-keyword frequency from recent mentions."""
from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass
class TrendSignal:
    keyword: str
    count: int
    samples: list[str]


def collect_trend_signals(conn: sqlite3.Connection, *, hours: int = 24,
                          limit_samples: int = 5) -> list[TrendSignal]:
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    rows = conn.execute(
        "SELECT matched_keywords, text FROM mentions WHERE seen_at >= ?",
        (cutoff,),
    ).fetchall()
    by_kw: dict[str, list[str]] = {}
    for row in rows:
        for kw in json.loads(row["matched_keywords"]):
            by_kw.setdefault(kw, []).append(row["text"])
    signals = [
        TrendSignal(keyword=kw, count=len(texts), samples=texts[:limit_samples])
        for kw, texts in by_kw.items()
    ]
    signals.sort(key=lambda s: s.count, reverse=True)
    return signals
