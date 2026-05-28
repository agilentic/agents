"""X publisher via tweepy. Requires user-context OAuth1 keys for posting."""
from __future__ import annotations

from .base import Publisher, PublishResult


class XPublisher(Publisher):
    platform = "x"

    def __init__(self, *, api_key: str | None, api_secret: str | None,
                 access_token: str | None, access_secret: str | None,
                 dry_run: bool = True) -> None:
        super().__init__(dry_run=dry_run)
        self._creds = (api_key, api_secret, access_token, access_secret)

    def publish(self, body: str) -> PublishResult:
        if self.dry_run:
            return PublishResult(self.platform, dry_run=True, external_id=None, url=None)
        if not all(self._creds):
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error="missing X OAuth1 credentials")
        try:
            import tweepy
        except ImportError:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error="tweepy not installed")
        api_key, api_secret, access_token, access_secret = self._creds
        client = tweepy.Client(
            consumer_key=api_key, consumer_secret=api_secret,
            access_token=access_token, access_token_secret=access_secret,
        )
        try:
            resp = client.create_tweet(text=body)
            tid = resp.data["id"]
            return PublishResult(self.platform, dry_run=False, external_id=str(tid),
                                url=f"https://x.com/i/web/status/{tid}")
        except Exception as e:
            return PublishResult(self.platform, dry_run=False, external_id=None,
                                url=None, error=str(e))
