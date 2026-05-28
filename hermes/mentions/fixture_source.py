"""Fixture-backed mentions source for tests + first-run dry-run demo."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from .base import Mention, MentionsSource


class FixtureSource(MentionsSource):
    def __init__(self, platform: str, fixture_path: Path) -> None:
        self.platform = platform
        self._path = fixture_path

    def fetch(self, keywords: Iterable[str]) -> Iterable[Mention]:
        kws = [k for k in keywords if k]
        rows = json.loads(self._path.read_text())
        out: list[Mention] = []
        for row in rows:
            if row.get("platform") != self.platform:
                continue
            text = row["text"]
            matched = self.match_keywords(text, kws) if kws else tuple(row.get("matched", []))
            if kws and not matched:
                continue
            out.append(Mention(
                platform=self.platform, external_id=row["id"],
                author=row.get("author"), text=text, url=row.get("url"),
                matched_keywords=matched, raw=row,
            ))
        return out
