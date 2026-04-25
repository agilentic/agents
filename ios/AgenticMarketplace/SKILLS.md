# Agentic Marketplace Skills Catalog

This markdown file defines starter skill packs for the SwiftUI **Conductor Market** layout.

## Skill Manifest Pattern

Use this structure when adding new skill bundles:

```md
### Skill: <name>
- **Use case:** <what problem it solves>
- **Inputs:** <data/contracts it expects>
- **Outputs:** <artifacts/actions produced>
- **Safety checks:** <guardrails>
- **Price tier:** <free | pro | enterprise>
```

## Starter Skills

### Skill: Lead Enrichment
- **Use case:** Add intent, persona, and firmographic context to raw lead lists.
- **Inputs:** Company domain, contact name, optional CRM metadata.
- **Outputs:** Normalized lead profile + score from 0-100.
- **Safety checks:** PII redaction and confidence thresholds before publish.
- **Price tier:** pro.

### Skill: Prompt Guardrails
- **Use case:** Ensure workflows follow policy and brand voice.
- **Inputs:** Prompt template, policy profile, tone settings.
- **Outputs:** Sanitized prompt and rejection reasons (if blocked).
- **Safety checks:** Injection detection + content policy scanning.
- **Price tier:** enterprise.

### Skill: Multi-step Memory
- **Use case:** Maintain long-running context across agent handoffs.
- **Inputs:** Session transcript, retrieval index, context budget.
- **Outputs:** Summary memory packets + retrieval citations.
- **Safety checks:** Context truncation and stale-memory expiry.
- **Price tier:** pro.

### Skill: QA Automator
- **Use case:** Validate agent workflows before users run them.
- **Inputs:** URL or API endpoint, acceptance checklist.
- **Outputs:** Pass/fail report with regression diff.
- **Safety checks:** Read-only credentials and scoped environments.
- **Price tier:** pro.
