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
    <main className="p-6 space-y-6">
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
    </main>
  );
}
