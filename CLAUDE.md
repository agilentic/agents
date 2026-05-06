# Claude Configuration

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

**Setup (one-time per machine):**
```bash
git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup
```

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool.

- Brainstorm / new idea → `/office-hours`
- Strategy / scope → `/plan-ceo-review`
- Architecture review → `/plan-eng-review`
- Design system / brand → `/design-consultation`
- Design review of plan → `/plan-design-review`
- DX review of plan → `/plan-devex-review`
- Full review pipeline → `/autoplan`
- Bug / broken behavior → `/investigate`
- QA / site testing → `/qa` or `/qa-only`
- Code review → `/review`
- Visual polish → `/design-review`
- DX audit → `/devex-review`
- Ship / deploy / PR → `/ship`
- Merge + deploy + verify → `/land-and-deploy`
- Post-deploy monitoring → `/canary`
- Update docs → `/document-release`
- Weekly retro → `/retro`
- Second opinion → `/codex`
- Security audit → `/cso`
- Save progress → `/context-save`
- Resume session → `/context-restore`
- Upgrade gstack → `/gstack-upgrade`
