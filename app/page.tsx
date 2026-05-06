const STATS = [
  { label: 'Jobs Discovered', value: '0', color: '#6366f1' },
  { label: 'Applications Sent', value: '0', color: '#22c55e' },
  { label: 'Response Rate', value: '—', color: '#f59e0b' },
  { label: 'CV Versions', value: '0', color: '#8b5cf6' },
];

const ACTIONS = [
  { label: 'Hermes Studio', description: 'Run autoresearch or job-application pipeline', href: '/hermes', color: '#6366f1' },
  { label: 'Trading Cockpit', description: 'LLM-powered trading agent dashboard', href: '/trading', color: '#22c55e' },
  { label: 'Application Tracker', description: 'Track and manage all submitted applications', href: '/tracker', color: '#f59e0b' },
  { label: 'Career Plan', description: 'Skills-gap analysis and upskilling roadmap', href: '/career', color: '#8b5cf6' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        padding: '0 2rem',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--color-surface)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: '1.0625rem' }}>Hermes</span>
          <span style={{
            fontSize: '0.6875rem', color: 'var(--color-accent)',
            background: 'var(--color-accent-dim)', padding: '2px 8px',
            borderRadius: 999, fontWeight: 500,
          }}>Agentic Automation Hub</span>
        </div>
        <nav style={{ display: 'flex', gap: 24 }}>
          {ACTIONS.map((a) => (
            <a key={a.href} href={a.href} style={{ color: 'var(--color-font-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
              {a.label}
            </a>
          ))}
        </nav>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            Your career transition, automated.
          </h1>
          <p style={{ color: 'var(--color-font-muted)', margin: 0 }}>
            Hermes discovers jobs, tailors your CV, applies on your behalf, and plans your upskilling.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: '2.5rem' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 12, padding: '1.25rem 1.5rem',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-font-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-font-muted)', marginBottom: 12 }}>Control Rooms</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: '2.5rem' }}>
          {ACTIONS.map((a) => (
            <a key={a.href} href={a.href} style={{
              display: 'block', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: 12,
              padding: '1.5rem', textDecoration: 'none',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, marginBottom: 10 }} />
              <div style={{ fontWeight: 600, color: 'var(--color-font-primary)', marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-font-muted)' }}>{a.description}</div>
            </a>
          ))}
        </div>

        <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-font-muted)', marginBottom: 12 }}>Agent Pipeline</p>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 12, padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto',
        }}>
          {['Job Discovery', 'JD Analyzer', 'CV Optimizer', 'Apply', 'Tracker', 'Career Planner'].map((name, i, arr) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                borderRadius: 8, padding: '0.4375rem 0.875rem',
                fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap',
              }}>{name}</div>
              {i < arr.length - 1 && <div style={{ color: 'var(--color-font-muted)', padding: '0 6px', fontSize: '0.875rem' }}>&rarr;</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
