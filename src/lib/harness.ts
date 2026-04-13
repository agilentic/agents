/**
 * Harness-based cost-adjusted utility scoring
 *
 * Inspired by EleutherAI's lm-evaluation-harness philosophy:
 * measure model capability across standardised tasks, then normalise
 * against cost to find the true "best value" model for a given workload.
 *
 * Methodology
 * ───────────
 * 1. Quality Score  — weighted average of available benchmark scores (0–100)
 * 2. Blended Cost   — (inputRatio × inputPrice + outputRatio × outputPrice)
 *                     per 1 M tokens in USD
 * 3. Raw Efficiency — qualityScore / blendedCost  (quality points per $)
 * 4. Harness Score  — raw efficiency normalised to 0–100 across the model set
 *
 * Workload Profiles
 * ─────────────────
 * Different applications weight benchmarks differently:
 *   general   → balanced across MMLU, coding, math, science
 *   coding    → heavily weighted toward HumanEval
 *   reasoning → MATH + GPQA heavy (logic, science, PhD-level Q&A)
 *   research  → GPQA + MMLU heavy (scientific knowledge)
 *   chat      → MT-Bench + MMLU (instruction following + knowledge)
 */

import type { ModelEntry, BenchmarkScores } from '@/src/data/pricing-registry';
import { MODELS, blendedCost } from '@/src/data/pricing-registry';

// ── Types ─────────────────────────────────────────────────────────────────────

export type WorkloadProfile = 'general' | 'coding' | 'reasoning' | 'research' | 'chat';

export interface BenchmarkWeights {
  mmlu: number;
  humanEval: number;
  math: number;
  gpqa: number;
  mtBench: number;
  bbh: number;
}

export interface HarnessResult {
  modelId: string;
  modelName: string;
  provider: string;
  providerSlug: string;
  qualityScore: number;     // 0–100, weighted benchmark average
  blendedCostPerM: number;  // USD per 1 M tokens
  rawEfficiency: number;    // quality / cost (un-normalised)
  harnessScore: number;     // 0–100, normalised across all models
  rank: number;             // 1 = best value
  tier: string;
  isEstimated: boolean;
}

export const WORKLOAD_PROFILES: Record<WorkloadProfile, { label: string; description: string; weights: BenchmarkWeights }> = {
  general: {
    label: 'General Purpose',
    description: 'Balanced use — chat, analysis, writing, some coding',
    weights: { mmlu: 0.30, humanEval: 0.20, math: 0.20, gpqa: 0.20, mtBench: 0.05, bbh: 0.05 },
  },
  coding: {
    label: 'Software Engineering',
    description: 'Code generation, review, debugging, refactoring',
    weights: { mmlu: 0.10, humanEval: 0.55, math: 0.20, gpqa: 0.05, mtBench: 0.05, bbh: 0.05 },
  },
  reasoning: {
    label: 'Complex Reasoning',
    description: 'Logic puzzles, multi-step derivations, math olympiads',
    weights: { mmlu: 0.15, humanEval: 0.15, math: 0.40, gpqa: 0.25, mtBench: 0.03, bbh: 0.02 },
  },
  research: {
    label: 'Scientific Research',
    description: 'Literature review, hypothesis generation, PhD-level Q&A',
    weights: { mmlu: 0.30, humanEval: 0.10, math: 0.15, gpqa: 0.40, mtBench: 0.03, bbh: 0.02 },
  },
  chat: {
    label: 'Conversational / RAG',
    description: 'Customer support, knowledge retrieval, summarisation',
    weights: { mmlu: 0.35, humanEval: 0.10, math: 0.10, gpqa: 0.10, mtBench: 0.30, bbh: 0.05 },
  },
};

// ── Computation ───────────────────────────────────────────────────────────────

/**
 * Compute a weighted quality score (0–100) for a model given a workload profile.
 * Benchmarks that are not available for a model are excluded from the weighted average.
 * mtBench is rescaled from 0–10 → 0–100 before weighting.
 */
export function qualityScore(
  benchmarks: BenchmarkScores,
  weights: BenchmarkWeights,
): number {
  const raw: Record<string, number | undefined> = {
    mmlu:      benchmarks.mmlu,
    humanEval: benchmarks.humanEval,
    math:      benchmarks.math,
    gpqa:      benchmarks.gpqa,
    mtBench:   benchmarks.mtBench != null ? benchmarks.mtBench * 10 : undefined,
    bbh:       benchmarks.bbh,
  };

  let weightSum = 0;
  let scoreSum = 0;
  for (const [key, weight] of Object.entries(weights) as [keyof BenchmarkWeights, number][]) {
    const score = raw[key];
    if (score != null) {
      scoreSum += score * weight;
      weightSum += weight;
    }
  }

  return weightSum > 0 ? scoreSum / weightSum : 0;
}

/**
 * Compute harness results for all (or a subset of) models.
 * Results are normalised so the most efficient model scores 100.
 */
export function computeHarness(
  models: ModelEntry[] = MODELS,
  profile: WorkloadProfile = 'general',
  inputRatio = 0.70,
): HarnessResult[] {
  const weights = WORKLOAD_PROFILES[profile].weights;

  // Phase 1: compute raw quality + cost for every model
  const raw = models.map(model => ({
    model,
    quality: qualityScore(model.benchmarks, weights),
    cost:    blendedCost(model, inputRatio),
  }));

  // Phase 2: compute raw efficiency  (avoid div/0 for free-tier models)
  const withEff = raw.map(r => ({
    ...r,
    rawEfficiency: r.cost > 0 ? r.quality / r.cost : 0,
  }));

  // Phase 3: normalise efficiency to 0–100
  const maxEff = Math.max(...withEff.map(r => r.rawEfficiency));
  const minEff = Math.min(...withEff.map(r => r.rawEfficiency));
  const range  = maxEff - minEff;

  const results: HarnessResult[] = withEff.map(r => ({
    modelId:         r.model.id,
    modelName:       r.model.name,
    provider:        r.model.provider,
    providerSlug:    r.model.providerSlug,
    qualityScore:    Math.round(r.quality * 10) / 10,
    blendedCostPerM: Math.round(r.cost * 100) / 100,
    rawEfficiency:   r.rawEfficiency,
    harnessScore:    range > 0 ? Math.round(((r.rawEfficiency - minEff) / range) * 100) : 100,
    rank:            0, // filled below
    tier:            r.model.tier,
    isEstimated:     r.model.benchmarks.estimated ?? false,
  }));

  // Phase 4: rank by harness score descending
  results.sort((a, b) => b.harnessScore - a.harnessScore);
  results.forEach((r, i) => { r.rank = i + 1; });

  return results;
}

/** Return just the top N models by harness score for a given profile. */
export function topModels(
  n: number,
  profile: WorkloadProfile = 'general',
): HarnessResult[] {
  return computeHarness(MODELS, profile).slice(0, n);
}

/** Summarise headline stats used in the dashboard hero section. */
export function dashboardStats() {
  const ranked = computeHarness(MODELS, 'general');
  const cheapest = [...MODELS].sort((a, b) => blendedCost(a) - blendedCost(b))[0];
  const bestQuality = ranked.reduce((best, r) => r.qualityScore > best.qualityScore ? r : best);
  const bestValue   = ranked[0]; // highest harness score

  return {
    totalModels:   MODELS.length,
    totalProviders: new Set(MODELS.map(m => m.providerSlug)).size,
    cheapestBlended: blendedCost(cheapest),
    cheapestModel:   cheapest.name,
    bestQualityScore:   bestQuality.qualityScore,
    bestQualityModel:   bestQuality.modelName,
    bestValueModel:     bestValue.modelName,
    bestValueScore:     bestValue.harnessScore,
    // Price range
    minInput: Math.min(...MODELS.map(m => m.inputPricePerMillion)),
    maxInput: Math.max(...MODELS.map(m => m.inputPricePerMillion)),
  };
}

/** Compute scatter-plot data: blended cost vs quality score for all models. */
export function efficiencyScatterData(profile: WorkloadProfile = 'general') {
  const weights = WORKLOAD_PROFILES[profile].weights;
  return MODELS.map(model => ({
    id:           model.id,
    name:         model.name,
    providerSlug: model.providerSlug,
    tier:         model.tier,
    cost:         Math.round(blendedCost(model) * 100) / 100,
    quality:      Math.round(qualityScore(model.benchmarks, weights) * 10) / 10,
    inputPrice:   model.inputPricePerMillion,
    outputPrice:  model.outputPricePerMillion,
    isEstimated:  model.benchmarks.estimated ?? false,
  }));
}

/** Group models by provider for the price bar chart. */
export function priceBarData() {
  return MODELS.map(model => ({
    name:         model.name,
    shortName:    model.name.length > 20 ? model.name.slice(0, 18) + '…' : model.name,
    providerSlug: model.providerSlug,
    input:        model.inputPricePerMillion,
    output:       model.outputPricePerMillion,
    blended:      Math.round(blendedCost(model) * 100) / 100,
    tier:         model.tier,
  })).sort((a, b) => a.blended - b.blended);
}

/** Per-provider aggregate stats. */
export function providerStats() {
  const byProvider: Record<string, ModelEntry[]> = {};
  for (const model of MODELS) {
    if (!byProvider[model.providerSlug]) byProvider[model.providerSlug] = [];
    byProvider[model.providerSlug].push(model);
  }
  const weights = WORKLOAD_PROFILES.general.weights;
  return Object.entries(byProvider).map(([slug, models]) => ({
    slug,
    provider: models[0].provider,
    count:    models.length,
    minBlended: Math.min(...models.map(m => blendedCost(m))),
    maxBlended: Math.max(...models.map(m => blendedCost(m))),
    avgQuality: Math.round(
      models.reduce((s, m) => s + qualityScore(m.benchmarks, weights), 0) / models.length * 10
    ) / 10,
    tiers:    [...new Set(models.map(m => m.tier))],
  }));
}
