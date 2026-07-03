export type PersonalityCode =
  | "ENTP"
  | "ENTJ"
  | "INTJ"
  | "INTP"
  | "ENFP"
  | "ENFJ"
  | "INFJ"
  | "INFP"
  | "ESTP"
  | "ESTJ"
  | "ISTJ"
  | "ISTP"
  | "ESFP"
  | "ESFJ"
  | "ISFJ"
  | "ISFP";

export interface ClientBrief {
  clientName: string;
  request: string;
  niche?: string;
  budgetUsd?: number;
}

export interface SwarmAgent {
  id: string;
  name: string;
  personality: PersonalityCode;
  role: string;
  skill: string;
  bestFor: string[];
  selfCheck: string[];
  failureMode: string;
}

export interface VerificationGate {
  id: string;
  name: string;
  blocking: boolean;
  passCondition: string;
  requiredEvidence: string[];
}

export interface SwarmWorkflow {
  id: string;
  name: string;
  promise: string;
  output: string[];
}

export interface SwarmPlan {
  brief: ClientBrief;
  workflow: SwarmWorkflow;
  loop: string[];
  agents: SwarmAgent[];
  gates: VerificationGate[];
  operatingRules: string[];
  onlineSkillSources: string[];
}

export function routeBriefToWorkflow(brief: ClientBrief): SwarmWorkflow {
  const request = brief.request.toLowerCase();
  if (request.includes("website") || request.includes("landing") || request.includes("lead capture")) {
    return {
      id: "website-factory",
      name: "48-Hour Website Swarm",
      promise: "A specialist AI production swarm turns a service-business brief into a conversion-ready website, QA report, and handoff package within 48 hours.",
      output: ["positioning brief", "landing page copy", "responsive website", "SEO metadata", "lead capture flow", "QA report", "deployment handoff"],
    };
  }

  if (request.includes("research") || request.includes("market")) {
    return {
      id: "research-swarm",
      name: "Market Research Swarm",
      promise: "A research, synthesis, and verification swarm produces a cited market map and opportunity memo.",
      output: ["source map", "competitor matrix", "market-sizing memo", "citation ledger", "executive brief"],
    };
  }

  return {
    id: "automation-sprint",
    name: "Automation Sprint Swarm",
    promise: "A planner-led automation swarm maps the workflow, builds a safe prototype, and verifies the operational handoff.",
    output: ["workflow map", "agent assignment plan", "prototype", "risk register", "handoff checklist"],
  };
}

export function getRecommendedSkillSources(): string[] {
  return [
    "ruvnet/claude-flow@agent-swarm — online skill result for swarm orchestration patterns",
    "ruvnet/claude-flow@agent-multi-repo-swarm — online skill result for multi-repo agent coordination",
    "ruvnet/claude-flow@github-project-management — online skill result for GitHub-native project control",
    "richfrem/agent-plugins-skills@agent-swarm — online skill result for plugin-style swarm operating cards",
    "software-development:subagent-driven-development — local Hermes skill for implementer/reviewer loops",
  ];
}

export const personalityAgents: SwarmAgent[] = [
  agent("entp-growth", "ENTP Growth Hacker", "ENTP", "Growth strategist", "Finds unexpected offer angles, viral hooks, and channel wedges.", ["hooks", "offers", "outreach"], ["Can name three non-obvious angles", "Every claim maps to buyer pain", "No gimmicks without a proof path"], "Over-ideates without feasibility checks"),
  agent("entj-ceo", "ENTJ CEO Operator", "ENTJ", "Commercial lead", "Turns the brief into priorities, budget, sequencing, and decision rules.", ["strategy", "pricing", "prioritization"], ["Outcome is measurable", "Scope fits budget/time", "Next action is owner-assigned"], "Optimizes speed over nuance"),
  agent("intj-architect", "INTJ Systems Architect", "INTJ", "Workflow architect", "Designs the loops, data model, and integration boundaries.", ["systems", "architecture", "automation"], ["Inputs and outputs are typed", "Failure path exists", "No hidden external side effects"], "Over-engineers v1"),
  agent("intp-research", "INTP Research Analyst", "INTP", "Evidence analyst", "Checks assumptions, sources facts, and keeps reasoning legible.", ["research", "logic", "citations"], ["Sources are recorded", "Contradictions are noted", "Uncertainty is labeled"], "Can stall in analysis"),
  agent("enfp-brand", "ENFP Brand Storyteller", "ENFP", "Brand narrative", "Creates emotionally resonant narratives and campaign concepts.", ["brand voice", "story", "creative concepts"], ["Voice matches audience", "Story supports CTA", "No generic AI phrasing"], "May make copy too expansive"),
  agent("enfj-client", "ENFJ Client Success", "ENFJ", "Client empathy", "Translates client ambiguity into reassuring updates and approval moments.", ["client updates", "onboarding", "trust"], ["Client risk is named", "Approval point is clear", "Tone is human"], "Can over-accommodate scope creep"),
  agent("infj-positioning", "INFJ Positioning Strategist", "INFJ", "Deep positioning", "Finds the core promise and buyer transformation.", ["positioning", "differentiation", "narrative"], ["Audience is specific", "Promise is differentiated", "Before/after is clear"], "Can become abstract"),
  agent("infp-voice", "INFP Voice Writer", "INFP", "Authentic copy", "Humanizes copy and removes hollow marketing language.", ["copy polish", "authenticity", "tone"], ["Sounds like a person", "No filler", "Keeps client values intact"], "Can soften conversion language"),
  agent("estp-sales", "ESTP Sales Closer", "ESTP", "Direct response", "Sharpens CTAs, objection handling, and urgency.", ["CTA", "sales", "objections"], ["CTA is visible", "Objections are answered", "Offer is concrete"], "Can become too aggressive"),
  agent("estj-ops", "ESTJ Operations Manager", "ESTJ", "Delivery operations", "Owns deadlines, task sequencing, and delivery completeness.", ["operations", "timeline", "handoff"], ["Every task has owner", "Blockers escalated", "Delivery checklist complete"], "Can be rigid when discovery changes"),
  agent("istj-qa", "ISTJ QA Operator", "ISTJ", "QA and compliance", "Runs checklists for requirements, links, forms, accessibility, and handoff.", ["QA", "compliance", "checklists"], ["All requirements traced", "Evidence captured", "No unresolved blocker"], "May miss creative upside"),
  agent("istp-fixer", "ISTP Technical Fixer", "ISTP", "Debugging and repair", "Fixes broken flows, build failures, and technical edge cases.", ["debugging", "build fixes", "integrations"], ["Root cause found", "Regression checked", "Fix is minimal"], "Can patch symptoms if rushed"),
  agent("esfp-social", "ESFP Social Spark", "ESFP", "Social content", "Turns deliverables into shareable posts, demos, and launch moments.", ["social", "launch", "creative assets"], ["Hook is clear", "Format fits channel", "No clickbait mismatch"], "Can chase novelty"),
  agent("esfj-community", "ESFJ Community Advocate", "ESFJ", "Customer empathy", "Represents support questions, audience anxieties, and onboarding friction.", ["support", "community", "FAQs"], ["FAQ answers real concerns", "Language is welcoming", "Next step is obvious"], "Can avoid hard tradeoffs"),
  agent("isfj-docs", "ISFJ Documentation Steward", "ISFJ", "Documentation", "Creates handoff docs, SOPs, and repeatable checklists.", ["docs", "SOPs", "handoff"], ["Steps are reproducible", "Commands are exact", "Owner can continue without us"], "Can document too much"),
  agent("isfp-design", "ISFP Visual Taste Critic", "ISFP", "Design critique", "Protects taste, visual hierarchy, and brand feel.", ["design", "visual QA", "brand feel"], ["Hierarchy scans well", "Spacing is consistent", "Design feels credible"], "Can under-explain subjective calls"),
];

function agent(
  id: string,
  name: string,
  personality: PersonalityCode,
  role: string,
  skill: string,
  bestFor: string[],
  selfCheck: string[],
  failureMode: string,
): SwarmAgent {
  return { id, name, personality, role, skill, bestFor, selfCheck, failureMode };
}

export const defaultGates: VerificationGate[] = [
  gate("brief", "Brief Gate", "Client goal, audience, offer, constraints, CTA, and approval owner are explicit before production starts.", ["structured-brief", "missing-info-log"]),
  gate("strategy", "Strategy Gate", "Positioning is specific, differentiated, commercially plausible, and tied to a measurable buyer action.", ["positioning-scorecard", "offer-map"]),
  gate("copy", "Copy Gate", "Above-fold copy names the audience, pain, promise, proof, and CTA in language a skeptical buyer understands in five seconds.", ["copy-review", "cta-map"]),
  gate("design", "Design Gate", "Visual direction is credible, mobile-first, accessible, and consistent enough to represent a real premium service business.", ["responsive-screenshot", "design-rubric"]),
  gate("technical", "Technical Gate", "The built artifact has working navigation, no console errors, responsive layouts, metadata, and a functioning lead-capture path or safe mock.", ["responsive-screenshot", "console-check", "form-test"]),
  gate("business", "Business Gate", "The deliverable can be used by the client immediately and has a clear path to leads, sales, or operational learning.", ["business-readiness-note", "risk-register"]),
  gate("delivery", "Delivery Gate", "Files, preview link, deployment notes, next actions, and client handoff instructions are packaged without hidden dependencies.", ["handoff-readme", "delivery-manifest"]),
];

function gate(id: string, name: string, passCondition: string, requiredEvidence: string[]): VerificationGate {
  return { id, name, blocking: true, passCondition, requiredEvidence };
}

export function buildSwarmPlan(brief: ClientBrief): SwarmPlan {
  return {
    brief,
    workflow: routeBriefToWorkflow(brief),
    loop: ["intake", "plan", "parallel-specialist-draft", "self-check", "critic-review", "revision", "verification-gates", "human-approval", "delivery", "retro-learning"],
    agents: personalityAgents,
    gates: defaultGates,
    operatingRules: [
      "Planner creates acceptance criteria before builders start.",
      "Builders must self-check before handing off.",
      "Critics and verifiers are separate from builders.",
      "No delivery gate passes without concrete evidence artifacts.",
      "Retros suggest improvements; humans approve before system changes.",
    ],
    onlineSkillSources: getRecommendedSkillSources(),
  };
}

export function calculateGateSummary(gates: VerificationGate[]) {
  const total = gates.length;
  const blocking = gates.filter((gate) => gate.blocking).length;
  return { total, blocking, readyLabel: `${total} gates / ${blocking} blocking` };
}
