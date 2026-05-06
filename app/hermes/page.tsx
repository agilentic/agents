'use client';

import { useState } from 'react';

interface HermesRunResult {
  generatedAt: string;
  topic: string;
  objective: string;
  agents: { id: string; codename: string; avatar: string; mission: string; specialty: string }[];
  findings: { agentId: string; summary: string; nextAction: string }[];
  synthesis: string;
}

const PIPELINE = [
  { name: 'jobDiscovery', label: 'Job Discovery', description: 'Scrapes LinkedIn, Glassdoor, eFinancialCareers, Indeed, JobsDB, and company sites.' },
  { name: 'jdAnalyzer', label: 'JD Analyzer', description: 'Extracts skills, seniority, and keywords via LLM.' },
  { name: 'cvOptimizer', label: 'CV Optimizer', description: 'Rewrites CV and cover letter per role using GPT-4o.' },
  { name: 'apply', label: 'Apply', description: 'Submits applications via Playwright automation.' },
  { name: 'tracker', label: 'Tracker', description: 'Persists outcomes to Postgres via Prisma.' },
];

const ROUTING_MODES = [
  { title: 'Addressed', description: 'Set msg.to to agent name(s).', example: "{ content: 'apply', to: 'apply' }" },
  { title: 'Rule-based', description: 'Register HermesRoute matchers; first match wins.', example: "{ match: msg => msg.content === 'discover', to: 'jobDiscovery' }" },
  { title: 'Broadcast', description: 'No to + no matching route = fan-out to all agents.', example: "{ content: 'ping' }" },
];

export default function HermesPage() {
  const [topic, setTopic] = useState('Autonomous webapp design with two Hermes agents');
  const [objective, setObjective] = useState('Produce a high-conviction layout and implementation plan with AI avatars.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HermesRunResult | null>(null);

  const runAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hermes/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, objective }),
      });
      if (!res.ok) throw new Error('Hermes run failed');
      setResult(await res.json());
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">

      {/* ── Auto-research studio ── */}
      <section className="space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-widest">Hermes Studio</p>
          <h1 className="text-3xl font-semibold">Autoresearch Studio</h1>
          <p className="text-gray-400 max-w-2xl text-sm">
            Two AI-avatar agents collaborate: Alpha scouts breadth, Omega synthesises depth.
            Hit Run to generate a research brief.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Topic</span>
            <input
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Objective</span>
            <input
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-indigo-500"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </label>
        </div>

        <button
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          onClick={runAgents}
          disabled={loading}
        >
          {loading ? 'Running agents…' : 'Run Hermes autoresearch'}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}

        {result && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {result.agents.map((agent) => (
                <article key={agent.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{agent.avatar}</span>
                    <div>
                      <p className="font-semibold">{agent.codename}</p>
                      <p className="text-xs text-gray-500">{agent.specialty}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{agent.mission}</p>
                </article>
              ))}
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Findings</h2>
              {result.findings.map((f) => (
                <div key={f.agentId} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
                  <p className="text-sm text-gray-300">{f.summary}</p>
                  <p className="mt-2 text-xs text-gray-500">Next: {f.nextAction}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-indigo-800 bg-indigo-950 p-5">
              <h2 className="font-semibold text-indigo-300 mb-2">Team synthesis</h2>
              <p className="text-sm text-indigo-200">{result.synthesis}</p>
              <p className="mt-3 text-xs text-indigo-400">Generated {new Date(result.generatedAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </section>

      {/* ── Job-application pipeline ── */}
      <section className="space-y-6 border-t border-gray-800 pt-10">
        <header>
          <h2 className="text-2xl font-semibold">Job-Application Pipeline</h2>
          <p className="mt-1 text-sm text-gray-400">
            Hermes routes <code className="text-indigo-400">HermesMessage</code> objects through
            the career-transition pipeline. Addressed → Rule-based → Broadcast.
          </p>
        </header>

        <div className="space-y-3">
          {PIPELINE.map((step, i) => (
            <div key={step.name} className="flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">{step.label}</p>
                <p className="mt-0.5 text-sm text-gray-400">{step.description}</p>
                <code className="mt-1 inline-block text-xs text-indigo-400">{step.name}</code>
              </div>
              {i < PIPELINE.length - 1 && <div className="self-center text-gray-600">↓</div>}
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {ROUTING_MODES.map((m) => (
            <div key={m.title} className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-2">
              <p className="font-medium">{m.title}</p>
              <p className="text-sm text-gray-400">{m.description}</p>
              <pre className="text-xs text-indigo-400 whitespace-pre-wrap break-all">{m.example}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
