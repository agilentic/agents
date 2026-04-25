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

const PIPELINE: { name: string; label: string; description: string }[] = [
  {
    name: 'jobDiscovery',
    label: 'Job Discovery',
    description: 'Scrapes listings from LinkedIn, Glassdoor, Indeed, JobsDB, eFinancialCareers, and company sites.',
  },
  {
    name: 'jdAnalyzer',
    label: 'JD Analyzer',
    description: 'Extracts required skills, seniority, and keywords from each job description via LLM.',
  },
  {
    name: 'cvOptimizer',
    label: 'CV Optimizer',
    description: 'Rewrites the CV and cover letter to match each role using GPT-4o.',
  },
  {
    name: 'apply',
    label: 'Apply',
    description: 'Submits applications via Playwright automation on each target platform.',
  },
  {
    name: 'tracker',
    label: 'Tracker',
    description: 'Persists application outcomes to Postgres via Prisma.',
  },
];

const ROUTING_MODES = [
  {
    title: 'Addressed',
    description: 'Set msg.to to a single agent name or an array of names. Hermes delivers only to those agents.',
    example: `{ content: 'apply', to: 'apply' }`,
  },
  {
    title: 'Rule-based',
    description: 'Register HermesRoute objects. Hermes evaluates each rule in order and dispatches to the first match.',
    example: `{ match: msg => msg.content === 'discover', to: 'jobDiscovery' }`,
  },
  {
    title: 'Broadcast',
    description: 'Omit msg.to and define no matching route. Hermes fans the message out to all registered agents in parallel.',
    example: `{ content: 'ping' }`,
  },
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
      const response = await fetch('/api/hermes/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, objective }),
      });
      if (!response.ok) throw new Error('Hermes run failed');
      setResult((await response.json()) as HermesRunResult);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-10">
      {/* Autoresearch studio */}
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-gray-500">/design:handoff</p>
          <h1 className="text-3xl font-semibold">Hermes Agentic Autoresearch Studio</h1>
          <p className="max-w-3xl text-gray-700">
            This layout introduces two AI-avatar Hermes agents: one for broad signal discovery, one for deep synthesis.
            Use the run button to generate a collaborative research brief for your webapp roadmap.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Research Topic</span>
            <input className="rounded border px-3 py-2" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Objective</span>
            <input className="rounded border px-3 py-2" value={objective} onChange={(e) => setObjective(e.target.value)} />
          </label>
        </section>

        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" onClick={runAgents} disabled={loading}>
          {loading ? 'Running Hermes agents...' : 'Run Hermes autoresearch'}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {result && (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2">
              {result.agents.map((agent) => (
                <article key={agent.id} className="rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{agent.avatar}</div>
                    <div>
                      <h2 className="text-xl font-semibold">{agent.codename}</h2>
                      <p className="text-sm text-gray-500">{agent.specialty}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">{agent.mission}</p>
                </article>
              ))}
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold">Autoresearch findings</h2>
              {result.findings.map((item) => (
                <article key={item.agentId} className="rounded border p-3">
                  <p className="text-sm text-gray-700">{item.summary}</p>
                  <p className="mt-2 text-xs text-gray-500">Next: {item.nextAction}</p>
                </article>
              ))}
            </section>

            <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h2 className="text-lg font-semibold text-blue-900">Team synthesis</h2>
              <p className="mt-2 text-sm text-blue-950">{result.synthesis}</p>
              <p className="mt-2 text-xs text-blue-800">Generated at: {new Date(result.generatedAt).toLocaleString()}</p>
            </section>
          </div>
        )}
      </section>

      {/* Pipeline architecture */}
      <section className="max-w-3xl space-y-10">
        <header>
          <h2 className="text-2xl font-bold">Agent Pipeline</h2>
          <p className="mt-1 text-sm text-gray-400">
            Hermes sits at the centre of the network, routing{' '}
            <code className="text-indigo-400">HermesMessage</code> objects to
            whichever agents should act on them.
          </p>
        </header>

        <div className="space-y-3">
          {PIPELINE.map((step, i) => (
            <div
              key={step.name}
              className="flex items-start gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold">
                {i + 1}
              </div>
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="mt-0.5 text-sm text-gray-400">{step.description}</p>
                <code className="mt-1 inline-block text-xs text-indigo-400">{step.name}</code>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="ml-auto self-center text-gray-600 text-lg">↓</div>
              )}
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Routing Modes</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {ROUTING_MODES.map((mode) => (
              <div
                key={mode.title}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-2"
              >
                <p className="font-medium">{mode.title}</p>
                <p className="text-sm text-gray-400">{mode.description}</p>
                <pre className="text-xs text-indigo-400 whitespace-pre-wrap break-all">
                  {mode.example}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
