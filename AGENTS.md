# Agents

## Hermes (hermes/)

Social-media mentions monitor + AI-drafted post publisher.

- **Monitors** X for keyword mentions; LinkedIn via manual inbox; IG deferred.
- **Drafts** per-platform posts (X tweet, LinkedIn article, IG caption) using an LLM.
- **Dashboard** at `/` shows mentions, drafts (approve/reject), posts, and job runs.
- **Publishes** approved drafts. Default: dry-run (logs only, no live posting).
- **Records** everything in SQLite + JSONL append-only logs.

See `hermes/HERMES.md` for architecture, data flow, and onboarding steps.

### Hermes Agent (NousResearch)

The NousResearch Hermes Agent (`/home/user/hermes-agent/`) is cloned as a
reference / potential orchestration layer. It provides a chat-driven TUI and
gateway to Telegram/Discord/Slack/WhatsApp/Signal.

Future integration: use Hermes Agent as the operator console — query mentions,
review drafts, and approve posts via Telegram chat instead of the web dashboard.
