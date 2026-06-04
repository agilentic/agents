'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useRef, useState } from 'react';
import { Zap, DollarSign, TrendingUp, Database, Layers, GitBranch, ChevronRight, ArrowDown } from 'lucide-react';
import { dashboardStats, providerStats } from '@/src/lib/harness';
import { PROVIDER_COLORS } from '@/src/data/pricing-registry';
import { ModelTable } from '@/src/components/pricing/ModelTable';

// Dynamic imports for chart components (avoids SSR/window issues)
const PriceChart        = dynamic(() => import('@/src/components/pricing/PriceChart').then(m => ({ default: m.PriceChart })), { ssr: false, loading: () => <ChartSkeleton /> });
const EfficiencyScatter = dynamic(() => import('@/src/components/pricing/EfficiencyScatter').then(m => ({ default: m.EfficiencyScatter })), { ssr: false, loading: () => <ChartSkeleton /> });
const HarnessComparison = dynamic(() => import('@/src/components/pricing/HarnessComparison').then(m => ({ default: m.HarnessComparison })), { ssr: false, loading: () => <ChartSkeleton /> });
const CostCalculator    = dynamic(() => import('@/src/components/pricing/CostCalculator').then(m => ({ default: m.CostCalculator })), { ssr: false, loading: () => <ChartSkeleton /> });

function ChartSkeleton() {
  return (
    <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}

// ── Animated counter hook ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, decimals]);

  return value;
}

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="glass-card glass-card-hover gradient-border p-5 rounded-2xl flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: accent + '1a', border: `1px solid ${accent}33` }}
      >
        <div style={{ color: accent }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold font-mono text-slate-100 mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Provider card ────────────────────────────────────────────────────────────

function ProviderCard({ slug, provider, count, minBlended, maxBlended, avgQuality, tiers }: {
  slug: string; provider: string; count: number; minBlended: number; maxBlended: number; avgQuality: number; tiers: string[];
}) {
  const color = PROVIDER_COLORS[slug] ?? '#6366f1';
  const providerInitial = provider.slice(0, 2).toUpperCase();

  return (
    <div
      className="glass-card glass-card-hover p-4 rounded-2xl space-y-3 cursor-default"
      style={{ borderColor: color + '22' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: color + '20', color }}
        >
          {providerInitial}
        </div>
        <div>
          <p className="font-semibold text-slate-100 text-sm">{provider}</p>
          <p className="text-xs text-slate-500">{count} model{count !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-500">Price range</p>
          <p className="font-mono text-slate-300 mt-0.5">
            ${minBlended.toFixed(minBlended < 0.1 ? 3 : 2)} – ${maxBlended.toFixed(maxBlended < 1 ? 2 : 1)}<span className="text-slate-600">/M</span>
          </p>
        </div>
        <div>
          <p className="text-slate-500">Avg quality</p>
          <p className="font-mono mt-0.5" style={{ color }}>{avgQuality.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {tiers.map(t => (
          <span key={t} className={`badge text-[10px] capitalize badge-tier-${t}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  id,
  title,
  subtitle,
  children,
  accent,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          {accent && (
            <span className="w-1 h-6 rounded-full" style={{ backgroundColor: accent }} />
          )}
          <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
        </div>
        {subtitle && <p className="text-slate-500 ml-4">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// ── Nav link ─────────────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
      {children}
    </a>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const stats     = dashboardStats();
  const providers = providerStats();

  const modelCount = useCountUp(stats.totalModels, 800);
  const provCount  = useCountUp(stats.totalProviders, 600);

  return (
    <div className="min-h-screen bg-[#060814] relative overflow-x-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed top-[10%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-900/10 blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-cyan-900/8 blur-[80px] pointer-events-none" />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#060814]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-100 text-sm hidden sm:block">AI Pricing Intelligence</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#registry">Registry</NavLink>
            <NavLink href="#charts">Charts</NavLink>
            <NavLink href="#harness">Harness</NavLink>
            <NavLink href="#calculator">Calculator</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 hidden sm:block">
              {stats.totalModels} models · {stats.totalProviders} providers
            </span>
            <span className="badge bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]">
              Live Registry
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 relative">

        {/* ── Hero ── */}
        <section className="pt-8 pb-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="badge bg-violet-500/10 border border-violet-500/20 text-violet-300">
                April 2026 Edition
              </span>
              <span className="badge bg-white/[0.04] border border-white/[0.08] text-slate-400">
                {stats.totalModels} Models Tracked
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-100 leading-tight mb-5">
              Every Token
              <span className="gradient-text"> Has a Price.</span>
              <br className="hidden sm:block" />
              Find Your <span className="gradient-text">Sweet Spot.</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              Real-time pricing intelligence across {stats.totalProviders} AI providers. Compare input/output costs,
              quality-adjusted efficiency scores, and cross-provider access paths — so you can optimise for
              cost-adjusted utility, not just raw token price.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#registry"
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-all text-sm shadow-glow-purple"
              >
                Explore Models <ChevronRight className="w-4 h-4" />
              </a>
              <a
                href="#harness"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.1] text-slate-200 font-medium rounded-xl transition-all text-sm"
              >
                <Zap className="w-4 h-4 text-violet-400" /> Harness Rankings
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center mt-16">
            <a href="#stats" className="flex flex-col items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors">
              <span className="text-xs">Scroll to explore</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </a>
          </div>
        </section>

        {/* ── Stats ── */}
        <section id="stats">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Database className="w-5 h-5" />}
              label="Models Tracked"
              value={Math.round(modelCount).toString()}
              sub="Across 8 providers"
              accent="#a855f7"
            />
            <StatCard
              icon={<Layers className="w-5 h-5" />}
              label="Providers"
              value={Math.round(provCount).toString()}
              sub="Native + marketplace"
              accent="#3b82f6"
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5" />}
              label="Lowest Blended"
              value={`$${stats.cheapestBlended.toFixed(3)}`}
              sub={`${stats.cheapestModel} /1M tokens`}
              accent="#22c55e"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Best Value (Harness)"
              value={`#1 Score`}
              sub={stats.bestValueModel}
              accent="#f59e0b"
            />
          </div>
        </section>

        {/* ── Providers ── */}
        <Section
          id="providers"
          title="AI Providers"
          subtitle="All providers in the registry — including native APIs and inference marketplaces"
          accent="#06b6d4"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {providers.map(p => (
              <ProviderCard key={p.slug} {...p} />
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs text-slate-500 flex items-start gap-2">
            <GitBranch className="w-3.5 h-3.5 text-amber-400/70 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="text-amber-400/80">Provider vs. model note:</strong>{' '}
              AWS Bedrock, Google Vertex AI, and Azure OpenAI are inference runtimes — not model families.
              They host models from Anthropic, Meta, Mistral, and others at parity or slight premium to native APIs.
              &ldquo;Claw&rdquo; is not an official provider or model family; Anthropic&rsquo;s catalog uses the name{' '}
              <strong>Claude</strong> (model IDs: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5-20251001).
            </span>
          </div>
        </Section>

        {/* ── Model Registry ── */}
        <Section
          id="registry"
          title="Model Registry"
          subtitle="28 models with real pricing, benchmarks, and multi-provider access paths. Click any row to expand."
          accent="#a855f7"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <ModelTable />
          </div>
        </Section>

        {/* ── Charts ── */}
        <section id="charts">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-1 h-6 rounded-full bg-blue-500" />
              <h2 className="text-2xl font-bold text-slate-100">Price & Efficiency Analysis</h2>
            </div>
            <p className="text-slate-500 ml-4">Visual breakdowns of token costs and the quality-cost frontier</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-4 sm:p-6">
              <PriceChart />
            </div>
            <div className="glass-card rounded-2xl p-4 sm:p-6">
              <EfficiencyScatter />
            </div>
          </div>
        </section>

        {/* ── Harness Comparison ── */}
        <Section
          id="harness"
          title="Harness Efficiency Ranking"
          subtitle="Quality-adjusted cost scoring across workload profiles — optimise for utility, not just token price"
          accent="#f59e0b"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <HarnessComparison />
          </div>

          {/* Harness methodology detail */}
          <details className="mt-4">
            <summary className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer flex items-center gap-2 select-none">
              <ChevronRight className="w-4 h-4 transition-transform [[open]>summary_&]:rotate-90" />
              How the Harness Score is calculated
            </summary>
            <div className="mt-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-slate-400 space-y-3 leading-relaxed">
              <div>
                <p className="font-semibold text-slate-300 mb-1">1. Quality Score (0–100)</p>
                <p>A weighted average of published benchmark results: MMLU 5-shot, HumanEval pass@1, MATH 4-shot CoT, and GPQA Diamond. Weights differ per workload profile (e.g., coding weights HumanEval at 55 %; research weights GPQA at 40 %).</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">2. Blended Cost</p>
                <p>70 % input tokens + 30 % output tokens at the model&rsquo;s canonical price. This reflects typical production workload ratios; you can adjust with the Cost Calculator.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">3. Raw Efficiency</p>
                <p>Quality ÷ Blended Cost. A higher value means more benchmark performance per dollar.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300 mb-1">4. Normalisation</p>
                <p>Raw efficiency is linearly normalised to a 0–100 scale across the model set, so the most efficient model scores 100 and the least efficient scores 0.</p>
              </div>
              <p className="text-slate-600">Inspired by EleutherAI&rsquo;s lm-evaluation-harness philosophy. Models with estimated benchmarks are shown at 50 % opacity.</p>
            </div>
          </details>
        </Section>

        {/* ── Cost Calculator ── */}
        <Section
          id="calculator"
          title="Cost Calculator"
          subtitle="Interactive token estimator with side-by-side model comparison and monthly projections"
          accent="#22c55e"
        >
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <CostCalculator />
          </div>
        </Section>

        {/* ── Data Quality Banner ── */}
        <section>
          <div className="glass-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-1">Data Sources</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pricing from official provider documentation: OpenAI, Anthropic, Google AI, Mistral AI, Cohere, DeepSeek, Azure AI, Fireworks AI, Together AI, Groq. Benchmark scores from published papers and evals leaderboards.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-1">What &ldquo;Estimated&rdquo; Means</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Models marked <span className="text-amber-400">est.</span> have pricing or benchmark scores extrapolated from provider release materials, pattern-matching to prior model generations, or community evaluations rather than direct API price-page verification.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-1">Verify Before Committing</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                AI pricing changes frequently. Batch discounts, cached prompt tiers, and on-demand vs. provisioned throughput pricing are not reflected. Always confirm at the provider&rsquo;s pricing page before budgeting production workloads.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] mt-24 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-400">AI Pricing Intelligence</span>
            </div>
            <p className="text-xs text-slate-600 text-center">
              Registry: {new Date('2026-04-13').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ·
              {' '}{MODELS_COUNT} models · Prices in USD per 1 M tokens
            </p>
            <nav className="flex items-center gap-4 text-xs text-slate-600">
              <a href="/hermes" className="hover:text-slate-400 transition-colors">Hermes Studio</a>
              <span>·</span>
              <a href="/trading" className="hover:text-slate-400 transition-colors">Trading Cockpit</a>
              <span>·</span>
              <a href="/tracker" className="hover:text-slate-400 transition-colors">App Tracker</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Static constant to avoid calling dashboardStats() at render time for footer
const MODELS_COUNT = 28;
