# Agentic Automation Monorepo

This repository bundles a Next.js front-end with agentic back-end workflows for two domains:

1. **Job application automation**: discover roles, analyze descriptions with GPT-4o, optimize your CV, auto-apply via Playwright, and track submissions in a Postgres database.
2. **LLM-driven stock trading cockpit**: fetch market data, generate strategy with GPT-4o, plan risk-aware orders, and execute them in paper mode (or live if broker credentials are provided).

## Project Structure

```
app/                      # Next.js app router pages and API routes
scripts/                  # Automation entrypoints (auto-apply, auto-trade)
src/lib/agents/           # Agent teams and orchestrators
src/lib/automation/       # Playwright + broker automation helpers
src/lib/llm/              # LangChain-powered LLM utilities
src/lib/trading/          # Market data + trading planner utilities
prisma/                   # Prisma schema for persistent data
```

## Prerequisites

- Node.js 18+
- A Postgres database for Prisma (set `DATABASE_URL`)
- OpenAI API key (`OPENAI_API_KEY`) for GPT-4o calls
- Optional market data key: `ALPHA_VANTAGE_API_KEY` (fallback demo quotes are used if missing)
- Optional live trading credentials: `BROKER_EXECUTION_URL` and `BROKER_API_KEY` (paper trading is used otherwise)

## Setup

```bash
npm install
cp backend/.env.example backend/.env # if using the backend folder
```

Populate `.env` with the variables above plus any Playwright auth state required for job applications (e.g., `auth.json`).

## Usage

- **Run Next.js locally:**

  ```bash
  npm run dev
  ```

- **Auto-apply to jobs (agent team):**

  ```bash
  npm run auto-apply
  ```

- **Auto-trade (agent team + paper/live execution):**

  ```bash
  npm run auto-trade
  ```

  Or hit the API route `POST /api/trading/run` with `{ "watchlist": ["AAPL", "MSFT"], "capital": 10000, "maxRiskPerTrade": 0.02 }`, then view results on `/trading`.

## Key Components

- **Job discovery + apply:** `src/lib/agents/jobApplicationTeam.ts`, `src/lib/sources/*`, `src/lib/automation/*Apply.ts`
- **LLM optimizers:** `src/lib/llm/jdAnalyzer.ts`, `src/lib/llm/cvOptimizer.ts`
- **Trading agents:** `src/lib/agents/tradingTeam.ts`, `src/lib/trading/*`, `src/lib/llm/tradingAdvisor.ts`
- **UI:** `/trading` (agentic trading cockpit) and `/tracker` (job application tracker)

## Notes

- Playwright automation expects pre-saved authentication state files (e.g., `auth.json`) for each platform.
- Trading runs default to paper mode unless broker environment variables are provided; orders are still risk-sized using your provided capital and risk budget.
