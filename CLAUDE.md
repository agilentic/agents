## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).

## Hermes — Social Mentions + AI Posts

The `hermes/` subdirectory is a self-contained Python package for social-media
monitoring and AI-drafted posting. See `hermes/HERMES.md` for full architecture,
onboarding, and ToS warnings.

Key commands:
- **Dashboard**: `uvicorn hermes.dashboard.app:app --reload --port 8000`
- **Cron loop**: `python -m hermes.cron`
- **One-shot mention poll**: `python -c "from hermes.jobs import poll_mentions_job; print(poll_mentions_job())"`

Config lives in `hermes/.env` (copied from `hermes/.env.example`).
Default mode is **DRY RUN** — nothing posts until `HERMES_DRY_RUN=false`.

All data is recorded in SQLite (`hermes/hermes.db`) + JSONL logs (`hermes/logs/`).
