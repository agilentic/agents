"""X (Twitter) v2 recent-search mentions source.

Requires paid Basic tier ($100+/mo). Without X_BEARER_TOKEN this source
raises on fetch — it never returns fake data.
"""
from __future__ import annotations

from typing import Iterable

import httpx

from .base import Mention, MentionsSource

X_RECENT_SEARCH = "https://api.twitter.com/2/tweets/search/recent"


class XSource(MentionsSource):
    platform = "x"

    def __init__(self, bearer_token: str | None) -> None:
        if not bearer_token:
            raise RuntimeError(
                "XSource requires X_BEARER_TOKEN. Set it in .env or skip this source."
            )
        self._bearer = bearer_token

    def fetch(self, keywords: Iterable[str]) -> Iterable[Mention]:
        kws = [k for k in keywords if k]
        if not kws:
            return []
        query = "(" + " OR ".join(f'"{k}"' for k in kws) + ") -is:retweet lang:en"
        params = {
            "query": query,
            "max_results": "50",
            "tweet.fields": "author_id,created_at,lang,public_metrics",
            "expansions": "author_id",
            "user.fields": "username,name",
        }
        headers = {"Authorization": f"Bearer {self._bearer}"}
        with httpx.Client(timeout=30.0) as client:
            r = client.get(X_RECENT_SEARCH, params=params, headers=headers)
            r.raise_for_status()
            payload = r.json()
        users = {u["id"]: u for u in payload.get("includes", {}).get("users", [])}
        out: list[Mention] = []
        for tw in payload.get("data", []):
            user = users.get(tw.get("author_id"), {})
            author = user.get("username")
            url = f"https://x.com/{author}/status/{tw['id']}" if author else None
            matched = self.match_keywords(tw["text"], kws)
            out.append(Mention(
                platform=self.platform, external_id=str(tw["id"]),
                author=author, text=tw["text"], url=url,
                matched_keywords=matched, raw=tw,
            ))
        return out
