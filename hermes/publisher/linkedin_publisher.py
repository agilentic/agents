"""LinkedIn publisher via official UGC posts API.

Requires a LinkedIn app with w_member_social scope, user-context OAuth2 token,
and the actor URN. Personal-account posting is heavily restricted.
"""
from __future__ import annotations

import httpx

from .base import Publisher, PublishResult

UGC_POSTS = "https://api.linkedin.com/v2/ugcPosts"


class LinkedInPublisher(Publisher):
    platform = "linkedin"

    def __init__(self, *, access_token: str | None, actor_urn: str | None,
                 dry_run: bool = True) -> None:
        super().__init__(dry_run=dry_run)
        self._token = access_token
        self._actor = actor_urn

    def publish(self, body: str) -> PublishResult:
        if self.dry_run:
            return PublishResult(self.platform, dry_run=True, external_id=None, url=None)
        if not self._token or not self._actor:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error="missing LinkedIn token or actor URN")
        payload = {
            "author": self._actor,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": body},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        headers = {
            "Authorization": f"Bearer {self._token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }
        try:
            with httpx.Client(timeout=30.0) as client:
                r = client.post(UGC_POSTS, json=payload, headers=headers)
                r.raise_for_status()
                urn = r.headers.get("x-restli-id") or r.json().get("id")
                return PublishResult(self.platform, dry_run=False, external_id=urn, url=None)
        except httpx.HTTPStatusError as e:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error=f"{e.response.status_code}: {e.response.text}")
        except Exception as e:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error=str(e))
