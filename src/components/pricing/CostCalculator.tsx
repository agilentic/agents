'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, ChevronDown, ArrowUpDown, Zap } from 'lucide-react';
import { MODELS, PROVIDER_COLORS, type ModelEntry } from '@/src/data/pricing-registry';

function formatCost(usd: number): string {
  if (usd < 0.00001) return `$${usd.toExponential(2)}`;
  if (usd < 0.001)   return `$${usd.toFixed(6)}`;
  if (usd < 0.01)    return `$${usd.toFixed(5)}`;
  if (usd < 0.10)    return `$${usd.toFixed(4)}`;
  if (usd < 1)       return `$${usd.toFixed(3)}`;
  if (usd < 100)     return `$${usd.toFixed(2)}`;
  return `$${usd.toFixed(0)}`;
}

const PRESET_SCENARIOS = [
  { label: 'Single API call', inputK: 2, outputK: 1 },
  { label: 'Chat message pair', inputK: 4, outputK: 2 },
  { label: 'Document summary', inputK: 16, outputK: 4 },
  { label: '1 hour production (est.)', inputK: 500, outputK: 150 },
  { label: '1M user messages/day', inputK: 3000, outputK: 1000 },
];

function ModelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-9
                   text-sm text-slate-200 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
                   cursor-pointer transition-all hover:border-white/[0.12]"
      >
        {MODELS.map(m => (
          <option key={m.id} value={m.id} className="bg-slate-900">
            {m.name} ({m.provider})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
    </div>
  );
}

function TokenSlider({
  label,
  value,
  onChange,
  max = 1_000_000,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  color: string;
}) {
  const pct = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono text-slate-200 tabular-nums">
          {value >= 1_000_000
            ? `${(value / 1_000_000).toFixed(1)}M`
            : value >= 1_000
            ? `${(value / 1_000).toFixed(0)}K`
            : value}
          {' '}tokens
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/[0.06]">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={max / 1000}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all"
          style={{ left: `calc(${pct}% - 8px)`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function CostCalculator() {
  const [modelA, setModelA] = useState(MODELS[0].id);
  const [modelB, setModelB] = useState(MODELS[3].id);
  const [inputTokens,  setInputTokens]  = useState(10_000);
  const [outputTokens, setOutputTokens] = useState(2_000);
  const [compareMode, setCompareMode]   = useState(false);

  const getModel = (id: string) => MODELS.find(m => m.id === id)!;

  const calc = (model: ModelEntry, inTok: number, outTok: number) => ({
    input:  (inTok  / 1_000_000) * model.inputPricePerMillion,
    output: (outTok / 1_000_000) * model.outputPricePerMillion,
    total:  (inTok  / 1_000_000) * model.inputPricePerMillion +
            (outTok / 1_000_000) * model.outputPricePerMillion,
  });

  const mA = getModel(modelA);
  const mB = getModel(modelB);
  const costA = calc(mA, inputTokens, outputTokens);
  const costB = calc(mB, inputTokens, outputTokens);
  const colorA = PROVIDER_COLORS[mA.providerSlug] ?? '#6366f1';
  const colorB = PROVIDER_COLORS[mB.providerSlug] ?? '#22c55e';

  const savingsPct = compareMode && costA.total > 0
    ? Math.round(((costA.total - costB.total) / costA.total) * 100)
    : 0;

  const monthly = (cost: number) => {
    const perCall = cost;
    return {
      '1K calls/day': perCall * 1_000 * 30,
      '10K calls/day': perCall * 10_000 * 30,
      '100K calls/day': perCall * 100_000 * 30,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Cost Calculator</h3>
          <p className="text-sm text-slate-500 mt-0.5">Estimate token costs for your workload</p>
        </div>
        <button
          onClick={() => setCompareMode(v => !v)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            compareMode
              ? 'bg-violet-600/20 border-violet-500/40 text-violet-200'
              : 'border-white/[0.08] text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          Compare two models
        </button>
      </div>

      {/* Preset scenarios */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Quick presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map(s => (
            <button
              key={s.label}
              onClick={() => {
                setInputTokens(s.inputK * 1_000);
                setOutputTokens(s.outputK * 1_000);
              }}
              className="px-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12]
                         rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Token sliders */}
      <div className="glass-card p-5 rounded-2xl space-y-5">
        <TokenSlider
          label="Input tokens (prompt)"
          value={inputTokens}
          onChange={setInputTokens}
          max={500_000}
          color="#22c55e"
        />
        <TokenSlider
          label="Output tokens (completion)"
          value={outputTokens}
          onChange={setOutputTokens}
          max={100_000}
          color="#3b82f6"
        />
        <div className="flex gap-4 text-xs text-slate-500 pt-1 border-t border-white/[0.04]">
          <span>≈ {((inputTokens + outputTokens) / 750).toFixed(0)} words</span>
          <span>≈ {((inputTokens + outputTokens) / 4).toFixed(0)} chars</span>
        </div>
      </div>

      {/* Model selectors + results */}
      <div className={`grid gap-4 ${compareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Model A */}
        <div className="glass-card p-5 rounded-2xl space-y-4" style={{ borderColor: colorA + '22' }}>
          <ModelSelect value={modelA} onChange={setModelA} />
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">Input cost</p>
              <p className="font-mono font-bold text-emerald-400 text-lg">{formatCost(costA.input)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Output cost</p>
              <p className="font-mono font-bold text-blue-400 text-lg">{formatCost(costA.output)}</p>
            </div>
            <div className="relative">
              <p className="text-xs text-slate-500 mb-1">Total</p>
              <p className="font-mono font-bold text-xl" style={{ color: colorA }}>{formatCost(costA.total)}</p>
              {compareMode && savingsPct !== 0 && (
                <span className={`absolute -top-1 -right-1 text-[9px] font-bold px-1 rounded ${
                  savingsPct > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
                }`}>
                  {savingsPct > 0 ? `+${savingsPct}%` : `${savingsPct}%`}
                </span>
              )}
            </div>
          </div>

          {/* Monthly projection */}
          <div className="border-t border-white/[0.04] pt-3">
            <p className="text-xs text-slate-500 mb-2">Monthly projections</p>
            <div className="space-y-1">
              {Object.entries(monthly(costA.total)).map(([label, cost]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-mono text-slate-300">{formatCost(cost)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model B */}
        {compareMode && (
          <div className="glass-card p-5 rounded-2xl space-y-4" style={{ borderColor: colorB + '22' }}>
            <ModelSelect value={modelB} onChange={setModelB} />
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-500 mb-1">Input cost</p>
                <p className="font-mono font-bold text-emerald-400 text-lg">{formatCost(costB.input)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Output cost</p>
                <p className="font-mono font-bold text-blue-400 text-lg">{formatCost(costB.output)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Total</p>
                <p className="font-mono font-bold text-xl" style={{ color: colorB }}>{formatCost(costB.total)}</p>
              </div>
            </div>

            {/* Monthly projection */}
            <div className="border-t border-white/[0.04] pt-3">
              <p className="text-xs text-slate-500 mb-2">Monthly projections</p>
              <div className="space-y-1">
                {Object.entries(monthly(costB.total)).map(([label, cost]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-mono text-slate-300">{formatCost(cost)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Savings banner */}
      {compareMode && savingsPct !== 0 && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          savingsPct > 0
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-red-500/5 border-red-500/20'
        }`}>
          <Zap className={`w-5 h-5 flex-shrink-0 ${savingsPct > 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          <div className="text-sm">
            <span className="font-semibold text-slate-100">{mB.name}</span>
            {savingsPct > 0
              ? <span className="text-emerald-400"> costs {savingsPct}% less than {mA.name}</span>
              : <span className="text-red-400"> costs {Math.abs(savingsPct)}% more than {mA.name}</span>
            }
            <span className="text-slate-400"> for this token count ({formatCost(Math.abs(costA.total - costB.total))} difference)</span>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center">
        Prices in USD per 1 M tokens. Cached prompt discounts not included. Verify at provider pricing pages.
      </p>
    </div>
  );
}
