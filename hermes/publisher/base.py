"""Publisher interface. dry_run defaults True everywhere."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class PublishResult:
    platform: str
    dry_run: bool
    external_id: str | None
    url: str | None
    error: str | None = None

    @property
    def ok(self) -> bool:
        return self.error is None


class Publisher(ABC):
    platform: str

    def __init__(self, *, dry_run: bool = True) -> None:
        self.dry_run = dry_run

    @abstractmethod
    def publish(self, body: str) -> PublishResult:
        """Publish or simulate-publish. MUST honor self.dry_run."""
