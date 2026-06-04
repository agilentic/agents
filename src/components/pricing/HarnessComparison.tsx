'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { computeHarness, WORKLOAD_PROFILES, type WorkloadProfile } from '@/src/lib/harness';
import { PROVIDER_COLORS } from '@/src/data/pricing-registry';
import { Trophy, Zap, DollarSign, Info } from 'lucide-react';

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: ReturnType<typeof computeHarness>[number] }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl text-xs max-w-52">
      <p className="text-slate-100 font-semibold mb-2">#{d.rank} {d.modelName}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Harness Score</span>
          <span className="font-mono font-bold text-violet-300">{d.harnessScore}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Quality</span>
          <span className="font-mono text-slate-100">{d.qualityScore.toFixed(1)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Blended Cost</span>
          <span className="font-mono text-slate-100">
            ${d.blendedCostPerM.toFixed(d.blendedCostPerM < 0.1 ? 3 : 2)}/M
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Provider</span>
          <span className="text-slate-200">{d.provider}</span>
        </div>
        {d.isEstimated && (
          <p className="text-amber-400/80 text-[10px] mt-1">⚠ Estimated benchmarks used</p>
        )}
      </div>
    </div>
  );
}

export function HarnessComparison() {
  const [profile, setProfile] = useState<WorkloadProfile>('general');
  const [showAll, setShowAll]   = useState(false);

  const allResults = computeHarness(undefined, profile);
  const results    = showAll ? allResults : allResults.slice(0, 12);

  const medalColor = (rank: number) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#d97706';
    return undefined;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Harness Efficiency Ranking</h3>
          <p className="text-sm text-slate-500 mt-0.5">Quality-adjusted cost score — higher is better value per dollar</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(WORKLOAD_PROFILES) as WorkloadProfile[]).map(p => (
            <button
              key={p}
              onClick={() => setProfile(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                profile === p
                  ? 'bg-violet-600/30 border-violet-500/50 text-violet-200'
                  : 'border-white/[0.06] text-slate-400 hover:text-slate-200'
              }`}
            >
              {WORKLOAD_PROFILES[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile description */}
      <div className="flex items-start gap-2 p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl text-xs text-slate-400">
        <Info className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
        <span>{WORKLOAD_PROFILES[profile].description}</span>
      </div>

      {/* Podium (top 3) */}
      <div className="grid grid-cols-3 gap-3">
        {allResults.slice(0, 3).map((r, i) => {
          const color = PROVIDER_COLORS[r.providerSlug] ?? '#6366f1';
          const mc    = medalColor(r.rank)!;
          return (
            <div
              key={r.modelId}
              className={`glass-card p-4 rounded-2xl border text-center relative overflow-hidden
                ${i === 0 ? 'col-span-1 border-amber-500/20' : 'border-white/[0.06]'}`}
            >
              {i === 0 && (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
              )}
              <div className="text-2xl font-bold mb-1" style={{ color: mc }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
              </div>
              <p className="text-xs text-slate-400 mb-1">{r.provider}</p>
              <p className="font-semibold text-slate-100 text-sm leading-snug">{r.modelName}</p>
              <div className="mt-3 space-y-1">
                <div className="text-2xl font-bold font-mono" style={{ color }}>
                  {r.harnessScore}
                </div>
                <p className="text-[10px] text-slate-500">Harness Score</p>
                <p className="text-xs font-mono text-slate-400">
                  ${r.blendedCostPerM.toFixed(r.blendedCostPerM < 0.1 ? 3 : 2)}/M
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full bar chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={results}
            layout="vertical"
            margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
            barSize={14}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              type="category"
              dataKey="modelName"
              width={160}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="harnessScore" name="Harness Score" radius={[0, 4, 4, 0]}>
              {results.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PROVIDER_COLORS[entry.providerSlug] ?? '#6366f1'}
                  fillOpacity={entry.isEstimated ? 0.5 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {!showAll && allResults.length > 12 && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all"
        >
          Show all {allResults.length} models
        </button>
      )}

      {/* Methodology note */}
      <div className="flex items-start gap-2 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-slate-500">
        <Zap className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        <span>
          Harness Score = (weighted benchmark quality) / (blended cost) normalised 0–100.
          Weights vary by workload profile. Blended cost assumes 70 % input / 30 % output tokens.
          Models with estimated benchmarks shown at 50 % opacity.
        </span>
      </div>
    </div>
  );
}
