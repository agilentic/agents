# Job Application Automation System

This repo contains a prototype agentic workflow that automatically discovers jobs, optimizes your CV and cover letter with GPT-4o, applies across multiple platforms, and tracks applications.

## Key Components

- **LangChain JD Analyzer**: `src/lib/llm/jdAnalyzer.ts`
- **LangChain CV Optimizer**: `src/lib/llm/cvOptimizer.ts`
- **Playwright Apply scripts**: `src/lib/automation/*Apply.ts`
- **Supported platforms**: LinkedIn, Glassdoor, Indeed, JobsDB, eFinancialCareers, Company sites
- **Tracker Page**: `app/tracker/page.tsx`
- **API route**: `app/api/apply/route.ts`
- **Prisma Models**: `prisma/schema.prisma`
- **GitHub Actions**: `.github/workflows/auto-apply.yml`
- **MCP / A2A Agent Team**: `src/lib/agents`
- **Job source modules**: `src/lib/sources`

Run `npm run auto-apply` to execute the agent team locally or rely on the scheduled GitHub Action.
