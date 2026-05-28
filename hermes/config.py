"""Central env-driven config. Read once, validated, immutable."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Config:
    dry_run: bool
    db_path: Path
    log_dir: Path
    keywords: tuple[str, ...]

    llm_provider: str
    llm_api_key: str | None
    llm_model: str

    x_bearer_token: str | None
    x_api_key: str | None
    x_api_secret: str | None
    x_access_token: str | None
    x_access_secret: str | None

    linkedin_access_token: str | None
    linkedin_actor_urn: str | None

    ig_access_token: str | None
    ig_user_id: str | None

    poll_interval_minutes: int
    draft_interval_hours: int


def load() -> Config:
    keywords = tuple(
        k.strip() for k in os.getenv("HERMES_KEYWORDS", "").split(",") if k.strip()
    )
    base = Path(__file__).resolve().parent
    return Config(
        dry_run=_env_bool("HERMES_DRY_RUN", True),
        db_path=Path(os.getenv("HERMES_DB_PATH", str(base / "hermes.db"))),
        log_dir=Path(os.getenv("HERMES_LOG_DIR", str(base / "logs"))),
        keywords=keywords,
        llm_provider=os.getenv("HERMES_LLM_PROVIDER", "openrouter"),
        llm_api_key=os.getenv("HERMES_LLM_API_KEY"),
        llm_model=os.getenv("HERMES_LLM_MODEL", "anthropic/claude-sonnet-4-6"),
        x_bearer_token=os.getenv("X_BEARER_TOKEN"),
        x_api_key=os.getenv("X_API_KEY"),
        x_api_secret=os.getenv("X_API_SECRET"),
        x_access_token=os.getenv("X_ACCESS_TOKEN"),
        x_access_secret=os.getenv("X_ACCESS_SECRET"),
        linkedin_access_token=os.getenv("LINKEDIN_ACCESS_TOKEN"),
        linkedin_actor_urn=os.getenv("LINKEDIN_ACTOR_URN"),
        ig_access_token=os.getenv("IG_ACCESS_TOKEN"),
        ig_user_id=os.getenv("IG_USER_ID"),
        poll_interval_minutes=int(os.getenv("HERMES_POLL_INTERVAL_MIN", "15")),
        draft_interval_hours=int(os.getenv("HERMES_DRAFT_INTERVAL_HRS", "6")),
    )
