import { buildSwarmPlan, calculateGateSummary } from "../../src/lib/swarm/engine";

const plan = buildSwarmPlan({
  clientName: "Emkey Studio / Agilentic",
  request: "Build a 48-hour website swarm for service businesses with loops, plan mode, self-checks, dynamic workflows, personality cards, GitHub delivery, and verification gates.",
  niche: "AI-native automated agency",
  budgetUsd: 1500,
});

const gateSummary = calculateGateSummary(plan.gates);

const colors = {
  ink: "#111827",
  muted: "#667085",
  bg: "#f8f5ef",
  card: "#ffffff",
  border: "#e7dfd2",
  blue: "#3157ff",
  green: "#16835b",
  amber: "#b7791f",
};

const sectionStyle = {
  border: `1px solid ${colors.border}`,
  borderRadius: 28,
  background: "rgba(255,255,255,0.82)",
  boxShadow: "0 18px 60px rgba(17,24,39,0.08)",
} as const;

export default function SwarmPage() {
  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.ink, fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 56px" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 28 }}>
          <a href="/" style={{ color: colors.ink, textDecoration: "none", fontWeight: 800 }}>Agilentic Agents</a>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", color: colors.muted, fontSize: 14 }}>
            <a href="#agents" style={linkStyle}>Agents</a>
            <a href="#loop" style={linkStyle}>Loop</a>
            <a href="#gates" style={linkStyle}>Verification</a>
            <a href="#skills" style={linkStyle}>Online skills</a>
          </div>
        </nav>

        <section style={{ ...sectionStyle, padding: 36, background: "linear-gradient(135deg, #ffffff 0%, #eef2ff 58%, #f8f5ef 100%)" }}>
          <p style={eyebrowStyle}>Emkey Swarm OS v1 · GitHub-native automated agency system</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, .7fr)", gap: 28, alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "clamp(40px, 7vw, 76px)", lineHeight: 0.94, letterSpacing: "-0.06em", margin: "14px 0 20px" }}>
                Specialist AI swarms for 48-hour agency delivery.
              </h1>
              <p style={{ color: colors.muted, fontSize: 20, lineHeight: 1.55, maxWidth: 760 }}>
                A production operating system for turning client briefs into strategy, copy, design, code, QA evidence, and a packaged handoff — using loops, plan mode, self-checks, dynamic workflows, and personality cards.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
                <a style={primaryButton} href="#agents">Open swarm map</a>
                <a style={secondaryButton} href="#gates">Review gates</a>
              </div>
            </div>
            <aside style={{ padding: 24, borderRadius: 24, background: "rgba(17,24,39,0.92)", color: "white" }}>
              <p style={{ margin: 0, color: "#c7d2fe", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.16em" }}>Current workflow</p>
              <h2 style={{ margin: "12px 0", fontSize: 28 }}>{plan.workflow.name}</h2>
              <p style={{ color: "#d1d5db", lineHeight: 1.55 }}>{plan.workflow.promise}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
                <Stat label="Agents" value={`${plan.agents.length}`} />
                <Stat label="Gates" value={gateSummary.readyLabel} />
                <Stat label="Loop steps" value={`${plan.loop.length}`} />
                <Stat label="Mode" value="PR-based" />
              </div>
            </aside>
          </div>
        </section>

        <section id="loop" style={{ ...sectionStyle, padding: 28, marginTop: 24 }}>
          <Header eyebrow="Closed loop" title="Plan → Build → Check → Critique → Verify → Learn" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
            {plan.loop.map((step, index) => (
              <div key={step} style={{ border: `1px solid ${colors.border}`, borderRadius: 18, padding: 16, background: "#fff" }}>
                <span style={{ color: colors.blue, fontWeight: 800, fontSize: 13 }}>0{index + 1}</span>
                <p style={{ margin: "8px 0 0", fontWeight: 750, textTransform: "capitalize" }}>{step.replaceAll("-", " ")}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="agents" style={{ marginTop: 24 }}>
          <Header eyebrow="Personality + skill cards" title="16-agent specialist swarm" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
            {plan.agents.map((agent) => (
              <article key={agent.id} style={{ ...sectionStyle, padding: 20, borderRadius: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                  <div>
                    <p style={{ margin: 0, color: colors.blue, fontWeight: 800 }}>{agent.personality}</p>
                    <h3 style={{ margin: "6px 0 4px", fontSize: 20 }}>{agent.name}</h3>
                  </div>
                  <span style={badgeStyle}>{agent.role}</span>
                </div>
                <p style={{ color: colors.muted, lineHeight: 1.5 }}>{agent.skill}</p>
                <p style={{ fontSize: 13, color: colors.amber, margin: "14px 0 6px", fontWeight: 800 }}>Failure mode</p>
                <p style={{ margin: 0, color: colors.muted, fontSize: 14 }}>{agent.failureMode}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="gates" style={{ ...sectionStyle, padding: 28, marginTop: 24 }}>
          <Header eyebrow="Verification gates" title="No evidence, no delivery" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {plan.gates.map((gate) => (
              <article key={gate.id} style={{ border: `1px solid ${colors.border}`, borderRadius: 20, padding: 18, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <h3 style={{ margin: 0 }}>{gate.name}</h3>
                  <span style={{ ...badgeStyle, color: colors.green, borderColor: "#bbf7d0", background: "#f0fdf4" }}>blocking</span>
                </div>
                <p style={{ color: colors.muted, lineHeight: 1.55 }}>{gate.passCondition}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {gate.requiredEvidence.map((evidence) => (
                    <span key={evidence} style={chipStyle}>{evidence}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" style={{ ...sectionStyle, padding: 28, marginTop: 24 }}>
          <Header eyebrow="Online skill search" title="Swarm sources discovered and baked into v1" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {plan.onlineSkillSources.map((source) => (
              <div key={source} style={{ border: `1px solid ${colors.border}`, borderRadius: 18, padding: 16, background: "#fff" }}>
                <p style={{ margin: 0, fontWeight: 750 }}>{source}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <h2 style={{ margin: "8px 0 0", fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.04em" }}>{title}</h2>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: 14 }}>
      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontWeight: 800 }}>{value}</p>
    </div>
  );
}

const linkStyle = { color: colors.muted, textDecoration: "none", fontWeight: 650 } as const;
const eyebrowStyle = { margin: 0, color: colors.blue, fontWeight: 850, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase" } as const;
const primaryButton = { display: "inline-flex", padding: "13px 18px", borderRadius: 999, background: colors.blue, color: "white", textDecoration: "none", fontWeight: 800 } as const;
const secondaryButton = { display: "inline-flex", padding: "13px 18px", borderRadius: 999, background: "white", color: colors.ink, textDecoration: "none", fontWeight: 800, border: `1px solid ${colors.border}` } as const;
const badgeStyle = { display: "inline-flex", border: `1px solid ${colors.border}`, background: "#f9fafb", color: colors.muted, borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 750 } as const;
const chipStyle = { display: "inline-flex", border: "1px solid #dbeafe", background: "#eff6ff", color: "#1e40af", borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 700 } as const;
