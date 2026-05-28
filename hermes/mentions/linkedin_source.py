"""LinkedIn mentions source.

LinkedIn has no public mentions API. This stub reads from manual_inbox.jsonl.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from .base import Mention, MentionsSource


class LinkedInManualSource(MentionsSource):
    platform = "linkedin"

    def __init__(self, inbox_path: Path) -> None:
        self._inbox = inbox_path

    def fetch(self, keywords: Iterable[str]) -> Iterable[Mention]:
        if not self._inbox.exists():
            return []
        kws = [k for k in keywords if k]
        out: list[Mention] = []
        with self._inbox.open() as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                row = json.loads(line)
                text = row.get("text", "")
                matched = self.match_keywords(text, kws)
                if not matched:
                    continue
                out.append(Mention(
                    platform=self.platform,
                    external_id=str(row.get("id") or row.get("url") or text[:40]),
                    author=row.get("author"), text=text, url=row.get("url"),
                    matched_keywords=matched, raw=row,
                ))
        return out
