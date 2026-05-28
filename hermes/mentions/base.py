"""Mentions source interface. New platforms = new MentionsSource subclass."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class Mention:
    platform: str
    external_id: str
    author: str | None
    text: str
    url: str | None
    matched_keywords: tuple[str, ...]
    raw: dict


class MentionsSource(ABC):
    platform: str

    @abstractmethod
    def fetch(self, keywords: Iterable[str]) -> Iterable[Mention]:
        """Yield mentions matching any of the given keywords."""

    @staticmethod
    def match_keywords(text: str, keywords: Iterable[str]) -> tuple[str, ...]:
        lo = text.lower()
        return tuple(k for k in keywords if k.lower() in lo)
