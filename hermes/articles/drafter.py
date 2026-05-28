"""LLM-driven per-platform post drafter (OpenAI-compatible endpoints)."""
from __future__ import annotations

from dataclasses import dataclass

from .trends import TrendSignal

PROVIDER_BASE_URL = {
    "openrouter": "https://openrouter.ai/api/v1",
    "nous": "https://inference-api.nousresearch.com/v1",
    "openai": "https://api.openai.com/v1",
}

PLATFORM_PROMPTS = {
    "x": (
        "Write a single tweet, max 270 chars, no hashtag spam, minimal emoji. "
        "Voice: insightful practitioner, not marketer. Lead with a concrete "
        "claim, not a question."
    ),
    "linkedin": (
        "Write a LinkedIn post, 120-220 words: hook, 2-3 specific points, soft "
        "CTA. No buzzwords (synergy, leverage, unlock). Plain text, no markdown."
    ),
    "instagram": (
        "Write an Instagram caption, 80-150 words, friendly and concrete. End "
        "with one CTA line. Up to 5 relevant hashtags on the last line."
    ),
}


@dataclass
class Draft:
    topic: str
    platform: str
    body: str


class Drafter:
    def __init__(self, *, provider: str, api_key: str | None, model: str) -> None:
        self.provider = provider
        self.api_key = api_key
        self.model = model

    def _client(self):
        if not self.api_key:
            raise RuntimeError("HERMES_LLM_API_KEY is not set")
        from openai import OpenAI
        base_url = PROVIDER_BASE_URL.get(self.provider)
        return OpenAI(api_key=self.api_key, base_url=base_url) if base_url else \
               OpenAI(api_key=self.api_key)

    def draft(self, *, signal: TrendSignal, platform: str) -> Draft:
        if platform not in PLATFORM_PROMPTS:
            raise ValueError(f"unknown platform: {platform}")
        sys = PLATFORM_PROMPTS[platform]
        user = (
            f"Trending keyword in our niche: '{signal.keyword}' "
            f"(seen in {signal.count} mentions in the last 24h).\n\n"
            "Sample mentions:\n" +
            "\n".join(f"- {s}" for s in signal.samples) +
            "\n\nDraft a post that adds genuine insight, not commentary on the "
            "mentions themselves. The reader should not be able to tell the post "
            "was prompted by social listening."
        )
        client = self._client()
        resp = client.chat.completions.create(
            model=self.model,
            messages=[{"role": "system", "content": sys},
                      {"role": "user", "content": user}],
            temperature=0.7,
        )
        body = resp.choices[0].message.content.strip()
        return Draft(topic=signal.keyword, platform=platform, body=body)
