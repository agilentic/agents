# Greg Isenberg Style Web App Monorepo

This repository contains a full-stack web application inspired by the design style of Greg Isenberg. It includes a React Native frontend (Expo) and an Express.js backend deployed to AWS Lambda, with Firebase Hosting for the frontend.

## Project Structure

```
/project-root
├── frontend/            # Expo React Native app with web build
├── backend/             # Express.js API for AWS Lambda
├── deployment/          # Firebase and GitHub Actions configs
└── README.md
```

## Getting Started

1. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
2. Copy environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Start the Expo app:
   ```bash
   cd ../frontend && npm start
   ```
4. Deploy frontend to Firebase Hosting:
   ```bash
   expo export:web -o web-build && firebase deploy
   ```
5. Deploy backend with Serverless Framework:
   ```bash
   cd ../backend && npx serverless deploy
   ```

## Testing

Run Jest tests in the frontend:

```bash
cd frontend && npm test
```

## Sample Data

Sample feature, testimonial, and blog data are located in `frontend/data/`.

=======
# Job Application Automation System

This repo contains a prototype agentic workflow that automatically discovers jobs, optimizes your CV and cover letter with GPT-4o, applies via LinkedIn, and tracks applications.
=======
## This repo contains a prototype agentic workflow that automatically discovers jobs, optimizes your CV and cover letter with GPT-4o, applies across multiple platforms, and tracks applications.


## Key Components

- **LangChain JD Analyzer**: `src/lib/llm/jdAnalyzer.ts`
- **LangChain CV Optimizer**: `src/lib/llm/cvOptimizer.ts`

- **Playwright LinkedIn Apply script**: `src/lib/automation/linkedinApply.ts`
=======
- **Playwright Apply scripts**: `src/lib/automation/*Apply.ts`
- **Supported platforms**: LinkedIn, Glassdoor, Indeed, JobsDB, eFinancialCareers, Company sites

- **Tracker Page**: `app/tracker/page.tsx`
- **API route**: `app/api/apply/route.ts`
- **Prisma Models**: `prisma/schema.prisma`
- **GitHub Actions**: `.github/workflows/auto-apply.yml`
- **MCP / A2A Agent Team**: `src/lib/agents`
- Run `npm run auto-apply` to execute the agent team locally or rely on the scheduled GitHub Action.
=======
- **Job source modules**: `src/lib/sources`

Run `npm run auto-apply` to execute the agent team locally or rely on the scheduled GitHub Action.
=======
# AI Hawk

Autonomous job application system that scrapes jobs, matches them to your profile, auto-generates resumes and cover letters, applies via browser automation, and tracks progress.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your API keys.

3. Run the main script:
```bash
python run.py
```

You can also launch the Streamlit UI:
```bash
streamlit run streamlit_app.py
```
main
