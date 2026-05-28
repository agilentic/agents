# Hermes — Social Mentions Monitor + AI-Drafted Posts

## What it does

1. **Monitors** X (Twitter) for keyword mentions on a schedule.
   LinkedIn/IG monitoring is stub-only (no public API — see limitations).
2. **Drafts** platform-specific articles/posts using an LLM when trends spike.
3. **Human reviews** drafts in a dashboard (approve/reject).
4. **Publishes** approved drafts to X, LinkedIn, and Instagram.
5. **Records** every mention, draft, post, and run in SQLite + JSONL logs.

Default mode is **DRY RUN** — everything logs but nothing posts.

## Architecture

```
hermes/
├── config.py             # env-driven config (reads .env)
├── db.py                 # SQLite schema + helpers
├── jobs.py               # poll_mentions, draft_posts, publish_approved
├── cron.py               # APScheduler entry point
├── mentions/
│   ├── base.py           # MentionsSource ABC
│   ├── x_source.py       # X v2 recent-search (paid tier)
│   ├── linkedin_source.py # manual-inbox stub
│   └── fixture_source.py # for tests + dry-run demo
├── publisher/
│   ├── base.py           # Publisher ABC, PublishResult
│   ├── x_publisher.py    # tweepy OAuth1
│   ├── linkedin_publisher.py # UGC posts API
│   └── instagram_publisher.py # Graph API (Business only)
├── articles/
│   ├── trends.py         # keyword frequency from recent mentions
│   └── drafter.py        # LLM-driven per-platform drafts
├── dashboard/
│   ├── app.py            # FastAPI — /api/mentions, /api/drafts, etc.
│   └── templates/
│       └── index.html    # single-page UI with approve/reject
├── .env.example          # every credential slot, all blank
├── requirements.txt      # hermes-specific Python deps
└── tests/fixtures/
    └── sample_mentions.json
```

## Data flow

```
[X API / fixture] ──poll_mentions──▸ mentions table
                                        │
                                        ▼
                               collect_trend_signals
                                        │
                                        ▼
                               Drafter.draft() ──▸ drafts table (status=pending)
                                                        │
                                                  [human approve]
                                                        │
                                                        ▼
                               Publisher.publish() ──▸ posts table + JSONL log
```

## Recording

Everything is dual-written:

| What           | SQLite table | JSONL log file            |
|----------------|-------------|---------------------------|
| Mentions       | `mentions`  | `logs/mentions.jsonl`     |
| Drafts         | `drafts`    | `logs/drafts.jsonl`       |
| Published posts| `posts`     | `logs/posts.jsonl`        |
| Job runs       | `runs`      | (SQLite only)             |

JSONL is append-only, never truncated. SQLite is the queryable index.

## Onboarding (you must do these steps)

### 1. Provision credentials

| Platform  | What you need | Where to get it |
|-----------|--------------|-----------------|
| LLM       | API key | openrouter.ai, portal.nousresearch.com, or platform.openai.com |
| X read    | Bearer token | developer.x.com — Basic tier, $100/mo |
| X write   | OAuth1 keys (4 values) | Same X dev app, "Keys and tokens" tab |
| LinkedIn  | OAuth2 token + actor URN | linkedin.com/developers — app with `w_member_social` |
| Instagram | Page token + IG user ID | developers.facebook.com — Business account required |

### 2. Copy .env

```bash
cp hermes/.env.example hermes/.env
# Fill in every line. NEVER commit hermes/.env.
```

### 3. Install deps

```bash
pip install -r hermes/requirements.txt
```

### 4. Run dry-run locally

```bash
# One-shot test (poll mentions from fixtures, draft, log):
python -c "from hermes.jobs import poll_mentions_job; print(poll_mentions_job())"

# Dashboard:
uvicorn hermes.dashboard.app:app --reload --port 8000

# Cron loop (dry run):
python -m hermes.cron
```

### 5. Deploy for real

Recommended: Fly.io hobby tier (free for low traffic).

```bash
# From agents/ root:
fly launch --name hermes-social --region iad
fly secrets set $(cat hermes/.env | xargs)
fly deploy
```

Or Docker: `docker-compose up` using the existing docker-compose.yml.

### 6. Go live (disable dry run)

**Only after you have reviewed at least 20 dry-run drafts and confirmed quality:**

```bash
# In .env:
HERMES_DRY_RUN=false
```

## Platform ToS warnings

- **X**: Automated posting via API is allowed on paid tiers but subject to rate limits and content policy. Avoid duplicate / near-duplicate tweets.
- **LinkedIn**: Personal-account API posting is restricted. The Marketing Developer Platform requires app review for company-page posting. Your app may be rejected.
- **Instagram**: Only Business/Creator accounts can post via API. Every post requires media (no text-only). AI-generated content at scale is a ban risk.

Recommendation: human-in-the-loop (approve in dashboard) permanently, not just for the first 7 days.

## Limitations (current)

- LinkedIn mentions: no public API. Source is manual-paste (`manual_inbox.jsonl`) or paid third-party.
- IG mentions: not supported.
- Trend detection: simple keyword frequency, not anomaly/spike detection.
- No multi-image or carousel support for IG.
- No thread/long-form support for X or LinkedIn.
