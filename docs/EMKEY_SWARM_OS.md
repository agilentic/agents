# Emkey Swarm OS v1

Emkey Swarm OS is a GitHub-native operating model for an automated agency that sells outcomes, not prompts.

## What this adds

- `/swarm` route: a polished control-room view for the swarm architecture.
- `src/lib/swarm/engine.ts`: deterministic workflow router, agent-card library, loop definition, and verification gates.
- `tests/swarm/engine.test.ts`: acceptance tests proving the plan has a closed loop, 16 personality/skill agents, blocking gates, and online skill-source references.

## Online skills searched

Hermes searched the public skills ecosystem with:

```bash
npx -y skills find "swarm agent github search"
npx -y skills find "agent swarm workflow personality cards verification"
```

Relevant results incorporated into the v1 design:

- `ruvnet/claude-flow@agent-swarm`
- `ruvnet/claude-flow@agent-multi-repo-swarm`
- `ruvnet/claude-flow@github-project-management`
- `richfrem/agent-plugins-skills@agent-swarm`
- local Hermes skill: `software-development:subagent-driven-development`

These were used as source inspiration for the operating model, not installed as runtime dependencies.

## Core workflow

```text
intake → plan → parallel-specialist-draft → self-check → critic-review → revision → verification-gates → human-approval → delivery → retro-learning
```

## Agent cards

The v1 swarm includes 16 MBTI-style operating cards:

| Card | Role |
|---|---|
| ENTP | Growth strategist |
| ENTJ | Commercial lead |
| INTJ | Workflow architect |
| INTP | Evidence analyst |
| ENFP | Brand storyteller |
| ENFJ | Client success |
| INFJ | Deep positioning |
| INFP | Authentic copy |
| ESTP | Direct response |
| ESTJ | Delivery operations |
| ISTJ | QA and compliance |
| ISTP | Debugging and repair |
| ESFP | Social launch |
| ESFJ | Customer empathy |
| ISFJ | Documentation |
| ISFP | Visual taste critique |

## Verification gates

Every delivery must pass these blocking gates:

1. Brief Gate
2. Strategy Gate
3. Copy Gate
4. Design Gate
5. Technical Gate
6. Business Gate
7. Delivery Gate

No evidence means no gate pass. This is the practical version of “close the loop, give the model a way to verify its own output.”

## Run locally

```bash
npm install
npm run test:swarm
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/swarm
```

## Next milestones

1. Add a persisted project model: `Client`, `Project`, `Brief`, `AgentRun`, `Artifact`, `GateReview`, `Learning`.
2. Connect each gate to evidence uploads/screenshots/test output.
3. Add a GitHub issue-to-swarm flow where each approved client brief creates a PR-based delivery branch.
4. Add a human approval queue before publishing, sending emails, or changing system prompts/skills.
5. Add a retro-learning workflow that proposes skill/card updates but requires approval before modifying the swarm.
