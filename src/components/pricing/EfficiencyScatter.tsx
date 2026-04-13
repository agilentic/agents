'use client';

import React, { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Label,
} from 'recharts';
import { efficiencyScatterData, WORKLOAD_PROFILES, type WorkloadProfile } from '@/src/lib/harness';
import { PROVIDER_COLORS } from '@/src/data/pricing-registry';

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: { payload: ReturnType<typeof efficiencyScatterData>[number] }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl text-xs max-w-52">
      <p className="text-slate-100 font-semibold mb-2">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Quality Score</span>
          <span className="font-mono text-slate-100">{d.quality.toFixed(1)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Blended Cost</span>
          <span className="font-mono text-slate-100">
            {d.cost < 0.1 ? `$${d.cost.toFixed(3)}` : `$${d.cost.toFixed(2)}`}/M
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Input Price</span>
          <span className="font-mono text-emerald-400">${d.inputPrice.toFixed(d.inputPrice < 0.1 ? 3 : 2)}/M</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Output Price</span>
          <span className="font-mono text-blue-400">${d.outputPrice.toFixed(d.outputPrice < 0.1 ? 3 : 2)}/M</span>
        </div>
        {d.isEstimated && (
          <p className="text-amber-400/80 text-[10px] mt-1">⚠ Estimated benchmark scores</p>
        )}
      </div>
    </div>
  );
}

function CustomDot(props: {
  cx?: number; cy?: number; payload?: ReturnType<typeof efficiencyScatterData>[number];
  [key: string]: unknown;
}) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const color = PROVIDER_COLORS[payload.providerSlug] ?? '#6366f1';
  const r = payload.tier === 'frontier' ? 7 : payload.tier === 'standard' ? 6 : 5;
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={r + 3}
        fill={color} fillOpacity={0.15}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill={color} fillOpacity={payload.isEstimated ? 0.5 : 0.9}
        stroke={color} strokeWidth={1.5} strokeOpacity={0.8}
      />
    </g>
  );
}

export function EfficiencyScatter() {
  const [profile, setProfile] = useState<WorkloadProfile>('general');
  const data = efficiencyScatterData(profile);

  const maxCost    = Math.max(...data.map(d => d.cost));
  const medQuality = data.reduce((s, d) => s + d.quality, 0) / data.length;
  const medCost    = [...data].sort((a, b) => a.cost - b.cost)[Math.floor(data.length / 2)].cost;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Efficiency Frontier</h3>
          <p className="text-sm text-slate-500 mt-0.5">Quality vs. cost — upper-left is best value</p>
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

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="cost"
              type="number"
              name="Blended Cost"
              scale="log"
              domain={[0.05, maxCost * 1.5]}
              tickFormatter={v => v < 0.1 ? `$${v.toFixed(3)}` : `$${v.toFixed(2)}`}
              tick={{ fontSize: 10, fill: '#64748b' }}
            >
              <Label value="Blended Cost / 1M tokens (log scale)" position="insideBottom" offset={-10} style={{ fill: '#475569', fontSize: 11 }} />
            </XAxis>
            <YAxis
              dataKey="quality"
              type="number"
              name="Quality Score"
              domain={[50, 100]}
              tick={{ fontSize: 10, fill: '#64748b' }}
            >
              <Label value="Quality Score" angle={-90} position="insideLeft" offset={10} style={{ fill: '#475569', fontSize: 11 }} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} cursor={false} />

            {/* Quadrant guide lines */}
            <ReferenceLine x={medCost} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <ReferenceLine y={medQuality} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />

            <Scatter
              data={data}
              shape={<CustomDot />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant legend */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="glass-card p-2.5 rounded-xl border-violet-500/20">
          <p className="font-medium text-violet-300">↖ Upper Left — Best Value</p>
          <p className="text-slate-500 mt-0.5">High quality, low cost</p>
        </div>
        <div className="glass-card p-2.5 rounded-xl border-amber-500/20">
          <p className="font-medium text-amber-300">↗ Upper Right — Premium</p>
          <p className="text-slate-500 mt-0.5">High quality, high cost</p>
        </div>
        <div className="glass-card p-2.5 rounded-xl border-slate-500/20">
          <p className="font-medium text-slate-400">↙ Lower Left — Budget</p>
          <p className="text-slate-500 mt-0.5">Lower quality, lower cost</p>
        </div>
        <div className="glass-card p-2.5 rounded-xl border-red-500/20">
          <p className="font-medium text-red-400">↘ Lower Right — Poor Value</p>
          <p className="text-slate-500 mt-0.5">Lower quality, high cost</p>
        </div>
      </div>

      {/* Provider legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {Object.entries(PROVIDER_COLORS).map(([slug, color]) => (
          <div key={slug} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span>{slug === 'openai' ? 'OpenAI' : slug === 'anthropic' ? 'Anthropic' : slug === 'google' ? 'Google' : slug === 'mistral' ? 'Mistral' : slug === 'meta' ? 'Meta' : slug === 'cohere' ? 'Cohere' : slug === 'deepseek' ? 'DeepSeek' : 'Microsoft'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
