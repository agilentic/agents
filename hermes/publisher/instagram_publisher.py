"""Instagram publisher via Graph API (Business/Creator accounts only).

Every IG post requires media — no text-only posts. This expects an image URL.
"""
from __future__ import annotations

import time

import httpx

from .base import Publisher, PublishResult

GRAPH_BASE = "https://graph.facebook.com/v20.0"


class InstagramPublisher(Publisher):
    platform = "instagram"

    def __init__(self, *, access_token: str | None, ig_user_id: str | None,
                 dry_run: bool = True) -> None:
        super().__init__(dry_run=dry_run)
        self._token = access_token
        self._user = ig_user_id

    def publish(self, body: str, *, image_url: str | None = None) -> PublishResult:
        if self.dry_run:
            return PublishResult(self.platform, dry_run=True, external_id=None, url=None)
        if not self._token or not self._user:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error="missing IG token or user id")
        if not image_url:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error="IG requires media; pass image_url")
        try:
            with httpx.Client(timeout=60.0) as client:
                container = client.post(
                    f"{GRAPH_BASE}/{self._user}/media",
                    params={"image_url": image_url, "caption": body,
                            "access_token": self._token},
                )
                container.raise_for_status()
                creation_id = container.json()["id"]
                time.sleep(2)
                publish = client.post(
                    f"{GRAPH_BASE}/{self._user}/media_publish",
                    params={"creation_id": creation_id, "access_token": self._token},
                )
                publish.raise_for_status()
                media_id = publish.json()["id"]
                return PublishResult(self.platform, dry_run=False,
                                    external_id=str(media_id), url=None)
        except httpx.HTTPStatusError as e:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error=f"{e.response.status_code}: {e.response.text}")
        except Exception as e:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error=str(e))
