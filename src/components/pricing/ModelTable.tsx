'use client';

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, ExternalLink, Info } from 'lucide-react';
import type { ModelEntry, ModelTier } from '@/src/data/pricing-registry';
import { MODELS, PROVIDER_COLORS, ALL_PROVIDERS, ALL_TIERS, blendedCost } from '@/src/data/pricing-registry';
import { qualityScore, WORKLOAD_PROFILES } from '@/src/lib/harness';

type SortKey = 'name' | 'provider' | 'input' | 'output' | 'blended' | 'quality' | 'context';
type SortDir = 'asc' | 'desc';

function formatPrice(n: number): string {
  if (n < 0.10) return `$${n.toFixed(3)}`;
  if (n < 1)    return `$${n.toFixed(2)}`;
  return `$${n.toFixed(2)}`;
}

function formatContext(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${(n / 1_000).toFixed(0)}K`;
}

function TierBadge({ tier }: { tier: ModelTier }) {
  const classes: Record<ModelTier, string> = {
    frontier: 'badge-tier-frontier',
    standard: 'badge-tier-standard',
    efficient: 'badge-tier-efficient',
    budget: 'badge-tier-budget',
  };
  return <span className={classes[tier]}>{tier}</span>;
}

function ProviderDot({ slug }: { slug: string }) {
  const color = PROVIDER_COLORS[slug] ?? '#6b7280';
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronDown className="w-3.5 h-3.5 opacity-30" />;
  return dir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-violet-400" />;
}

export function ModelTable() {
  const [query, setQuery]         = useState('');
  const [sortKey, setSortKey]     = useState<SortKey>('blended');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');
  const [provFilter, setProvFilter] = useState<string[]>([]);
  const [tierFilter, setTierFilter] = useState<ModelTier[]>([]);
  const [expanded, setExpanded]   = useState<string | null>(null);

  const weights = WORKLOAD_PROFILES.general.weights;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleProv = (p: string) =>
    setProvFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleTier = (t: ModelTier) =>
    setTierFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const filtered = useMemo(() => {
    let list = MODELS.filter(m => {
      const matchQ = query.length === 0 ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.provider.toLowerCase().includes(query.toLowerCase()) ||
        m.family.toLowerCase().includes(query.toLowerCase());
      const matchP = provFilter.length === 0 || provFilter.includes(m.providerSlug);
      const matchT = tierFilter.length === 0 || tierFilter.includes(m.tier);
      return matchQ && matchP && matchT;
    });

    list.sort((a, b) => {
      let va = 0, vb = 0;
      switch (sortKey) {
        case 'name':    return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'provider': return sortDir === 'asc' ? a.provider.localeCompare(b.provider) : b.provider.localeCompare(a.provider);
        case 'input':   va = a.inputPricePerMillion;  vb = b.inputPricePerMillion;  break;
        case 'output':  va = a.outputPricePerMillion; vb = b.outputPricePerMillion; break;
        case 'blended': va = blendedCost(a); vb = blendedCost(b); break;
        case 'quality': va = qualityScore(a.benchmarks, weights); vb = qualityScore(b.benchmarks, weights); break;
        case 'context': va = a.contextWindow; vb = b.contextWindow; break;
      }
      return sortDir === 'asc' ? va - vb : vb - va;
    });

    return list;
  }, [query, sortKey, sortDir, provFilter, tierFilter, weights]);

  const thClass = (key: SortKey) =>
    `px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer select-none
     hover:text-slate-200 transition-colors whitespace-nowrap ${sortKey === key ? 'text-violet-400' : ''}`;

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-start">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search models, providers, families…"
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200
                       placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
                       transition-all"
          />
        </div>

        {/* Provider filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
          {ALL_PROVIDERS.map(slug => {
            const active = provFilter.includes(slug);
            return (
              <button
                key={slug}
                onClick={() => toggleProv(slug)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? 'border-white/20 text-white'
                    : 'border-white/[0.06] text-slate-400 hover:border-white/[0.12] hover:text-slate-200'
                }`}
                style={active ? { backgroundColor: PROVIDER_COLORS[slug] + '33', borderColor: PROVIDER_COLORS[slug] + '66' } : {}}
              >
                {slug === 'openai' ? 'OpenAI' : slug === 'anthropic' ? 'Anthropic' : slug === 'google' ? 'Google' : slug === 'mistral' ? 'Mistral' : slug === 'meta' ? 'Meta' : slug === 'cohere' ? 'Cohere' : slug === 'deepseek' ? 'DeepSeek' : 'Microsoft'}
              </button>
            );
          })}
        </div>

        {/* Tier filters */}
        <div className="flex items-center gap-1.5">
          {ALL_TIERS.map(tier => {
            const active = tierFilter.includes(tier);
            return (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all capitalize ${
                  active ? 'bg-white/10 border-white/20 text-white' : 'border-white/[0.06] text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            );
          })}
        </div>

        <span className="ml-auto text-xs text-slate-500 self-center tabular-nums">
          {filtered.length} / {MODELS.length} models
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className={thClass('name')} onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Model <SortIcon active={sortKey === 'name'} dir={sortDir} /></div>
              </th>
              <th className={thClass('provider')} onClick={() => handleSort('provider')}>
                <div className="flex items-center gap-1">Provider <SortIcon active={sortKey === 'provider'} dir={sortDir} /></div>
              </th>
              <th className={thClass('input')} onClick={() => handleSort('input')}>
                <div className="flex items-center gap-1">Input /1M <SortIcon active={sortKey === 'input'} dir={sortDir} /></div>
              </th>
              <th className={thClass('output')} onClick={() => handleSort('output')}>
                <div className="flex items-center gap-1">Output /1M <SortIcon active={sortKey === 'output'} dir={sortDir} /></div>
              </th>
              <th className={thClass('blended')} onClick={() => handleSort('blended')}>
                <div className="flex items-center gap-1">Blended /1M <SortIcon active={sortKey === 'blended'} dir={sortDir} /></div>
              </th>
              <th className={thClass('quality')} onClick={() => handleSort('quality')}>
                <div className="flex items-center gap-1">Quality <SortIcon active={sortKey === 'quality'} dir={sortDir} /></div>
              </th>
              <th className={thClass('context')} onClick={() => handleSort('context')}>
                <div className="flex items-center gap-1">Context <SortIcon active={sortKey === 'context'} dir={sortDir} /></div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tier</th>
              <th className="px-3 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(model => {
              const quality = qualityScore(model.benchmarks, weights);
              const cost    = blendedCost(model);
              const isOpen  = expanded === model.id;

              return (
                <React.Fragment key={model.id}>
                  <tr
                    className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setExpanded(isOpen ? null : model.id)}
                  >
                    {/* Model name */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <ProviderDot slug={model.providerSlug} />
                        <span className="font-medium text-slate-100">{model.name}</span>
                        {model.benchmarks.estimated && (
                          <span className="badge bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px]">est.</span>
                        )}
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="px-3 py-3.5 text-slate-400">{model.provider}</td>

                    {/* Input price */}
                    <td className="px-3 py-3.5 font-mono text-emerald-400 tabular-nums">
                      {formatPrice(model.inputPricePerMillion)}
                    </td>

                    {/* Output price */}
                    <td className="px-3 py-3.5 font-mono text-blue-400 tabular-nums">
                      {formatPrice(model.outputPricePerMillion)}
                    </td>

                    {/* Blended cost */}
                    <td className="px-3 py-3.5 font-mono text-violet-300 tabular-nums font-semibold">
                      {formatPrice(cost)}
                    </td>

                    {/* Quality score */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${quality}%`,
                              backgroundColor: quality >= 85 ? '#a855f7' : quality >= 75 ? '#3b82f6' : quality >= 65 ? '#22c55e' : '#f59e0b',
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-300 tabular-nums">{quality.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Context window */}
                    <td className="px-3 py-3.5 text-slate-400 tabular-nums font-mono text-xs">
                      {formatContext(model.contextWindow)}
                    </td>

                    {/* Tier */}
                    <td className="px-3 py-3.5">
                      <TierBadge tier={model.tier} />
                    </td>

                    {/* Expand toggle */}
                    <td className="px-3 py-3.5">
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </td>
                  </tr>

                  {/* Expanded row */}
                  {isOpen && (
                    <tr className="bg-white/[0.015]">
                      <td colSpan={9} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Benchmarks */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Benchmarks</p>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: 'MMLU', val: model.benchmarks.mmlu },
                                { label: 'HumanEval', val: model.benchmarks.humanEval },
                                { label: 'MATH', val: model.benchmarks.math },
                                { label: 'GPQA', val: model.benchmarks.gpqa },
                                { label: 'MT-Bench', val: model.benchmarks.mtBench != null ? model.benchmarks.mtBench * 10 : undefined },
                                { label: 'BBH', val: model.benchmarks.bbh },
                              ].filter(b => b.val != null).map(b => (
                                <div key={b.label} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500">{b.label}</span>
                                  <span className="font-mono text-slate-200">{b.val!.toFixed(1)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Provider access */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available via</p>
                            <div className="space-y-1.5">
                              {model.accessVia.map((p, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-slate-300">{p.provider}</span>
                                  <div className="flex items-center gap-3 font-mono">
                                    <span className="text-emerald-400">{formatPrice(p.inputPricePerMillion)}</span>
                                    <span className="text-slate-600">/</span>
                                    <span className="text-blue-400">{formatPrice(p.outputPricePerMillion)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Capabilities & notes */}
                          <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Capabilities</p>
                            <div className="flex flex-wrap gap-1.5">
                              {model.capabilities.map(cap => (
                                <span key={cap} className="badge bg-white/[0.04] border border-white/[0.08] text-slate-400">{cap}</span>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          {model.notes && (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                              <p className="text-xs text-slate-400 leading-relaxed">{model.notes}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No models match your filters.</p>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 text-center">
        Blended cost = 70 % input + 30 % output · Quality = weighted benchmark average ·
        Prices in USD per 1 M tokens · Models marked &ldquo;est.&rdquo; use estimated pricing/benchmarks
      </p>
    </div>
  );
}
