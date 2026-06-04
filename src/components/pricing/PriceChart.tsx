'use client';

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { priceBarData } from '@/src/lib/harness';
import { PROVIDER_COLORS } from '@/src/data/pricing-registry';

const CHART_DATA = priceBarData();

type ViewMode = 'blended' | 'split';

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-200 font-medium mb-2 max-w-48 break-words">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="text-slate-100 font-mono ml-auto pl-4">
            {entry.value < 0.1 ? `$${entry.value.toFixed(3)}` : `$${entry.value.toFixed(2)}`}
          </span>
        </div>
      ))}
      <p className="text-slate-600 mt-2 text-[10px]">per 1M tokens</p>
    </div>
  );
}

export function PriceChart() {
  const [view, setView] = useState<ViewMode>('blended');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Token Price Comparison</h3>
          <p className="text-sm text-slate-500 mt-0.5">All {CHART_DATA.length} models, sorted by blended cost</p>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-lg p-1">
          {(['blended', 'split'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                view === v
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v === 'blended' ? 'Blended' : 'Input / Output'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={CHART_DATA}
            margin={{ top: 8, right: 16, left: 8, bottom: 80 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="shortName"
              angle={-45}
              textAnchor="end"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={0}
              height={90}
            />
            <YAxis
              tickFormatter={v => v < 0.1 ? `$${v.toFixed(3)}` : `$${v.toFixed(2)}`}
              tick={{ fontSize: 10, fill: '#64748b' }}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            {view === 'split' && (
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 8 }}
                iconType="square"
              />
            )}

            {view === 'blended' ? (
              <Bar dataKey="blended" name="Blended cost" radius={[4, 4, 0, 0]}>
                {CHART_DATA.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PROVIDER_COLORS[entry.providerSlug] ?? '#6366f1'}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            ) : (
              <>
                <Bar dataKey="input" name="Input" fill="#22c55e" radius={[2, 2, 0, 0]} fillOpacity={0.85} />
                <Bar dataKey="output" name="Output" fill="#3b82f6" radius={[2, 2, 0, 0]} fillOpacity={0.85} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Provider legend */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        {Object.entries(PROVIDER_COLORS).map(([slug, color]) => (
          <div key={slug} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <span className="capitalize">{slug === 'openai' ? 'OpenAI' : slug === 'anthropic' ? 'Anthropic' : slug === 'google' ? 'Google' : slug === 'mistral' ? 'Mistral' : slug === 'meta' ? 'Meta' : slug === 'cohere' ? 'Cohere' : slug === 'deepseek' ? 'DeepSeek' : 'Microsoft'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
