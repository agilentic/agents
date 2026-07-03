import assert from "node:assert/strict";
import {
  buildSwarmPlan,
  calculateGateSummary,
  getRecommendedSkillSources,
  routeBriefToWorkflow,
} from "../../src/lib/swarm/engine";

const brief = {
  clientName: "Premium longevity coach",
  request: "Build a 48-hour website swarm for a service business with landing page, lead capture, SEO, deployment and QA.",
  niche: "health coaching",
  budgetUsd: 1500,
};

const plan = buildSwarmPlan(brief);

assert.equal(routeBriefToWorkflow(brief).id, "website-factory");
assert.equal(plan.loop.length >= 6, true, "plan should include a closed production loop");
assert.equal(plan.agents.length >= 16, true, "plan should include at least 16 personality/skill agents");
assert.ok(plan.agents.some((agent) => agent.personality === "ENTP" && agent.role.includes("Growth")));
assert.ok(plan.agents.some((agent) => agent.personality === "ISTJ" && agent.role.includes("QA")));
assert.ok(plan.gates.some((gate) => gate.id === "technical" && gate.requiredEvidence.includes("responsive-screenshot")));
assert.ok(plan.gates.every((gate) => gate.passCondition.length > 20));

const summary = calculateGateSummary(plan.gates);
assert.equal(summary.total, plan.gates.length);
assert.equal(summary.blocking, plan.gates.filter((gate) => gate.blocking).length);
assert.equal(summary.readyLabel, "7 gates / 7 blocking");

const sources = getRecommendedSkillSources();
assert.ok(sources.some((source) => source.includes("ruvnet/claude-flow@agent-swarm")));
assert.ok(sources.some((source) => source.includes("richfrem/agent-plugins-skills@agent-swarm")));

console.log("swarm engine acceptance tests passed");
