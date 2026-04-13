/**
 * AI Model Pricing Registry
 *
 * Pricing data sourced from official provider documentation.
 * Prices denominated in USD per 1,000,000 tokens.
 * Benchmark scores from published evaluations (MMLU 5-shot, HumanEval pass@1,
 * MATH 4-shot CoT, GPQA Diamond). Scores marked `estimated: true` are
 * extrapolated from provider announcements or contemporaneous evaluations.
 *
 * NAMING NOTE: "Claw" is not an official model family in any provider catalog.
 * The Anthropic model family is named "Claude" (not "Claw"). Claude 4.x refers
 * to claude-opus-4-6, claude-sonnet-4-6, and claude-haiku-4-5, which are
 * runtime-accessible model IDs — not a separate catalog called "Claw."
 * AWS Bedrock, Google Vertex AI, and Azure OpenAI are deployment runtimes /
 * inference providers, not independent model families.
 *
 * Last verified: August 2025. Newer model prices (post-August 2025) are
 * marked estimated and sourced from provider release notes.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ModelTier = 'frontier' | 'standard' | 'efficient' | 'budget';
export type ModelStatus = 'ga' | 'preview' | 'deprecated' | 'estimated';
export type ProviderType =
  | 'native'
  | 'bedrock'
  | 'vertex'
  | 'azure'
  | 'groq'
  | 'fireworks'
  | 'together'
  | 'replicate'
  | 'self-hosted';

export type Capability =
  | 'chat'
  | 'vision'
  | 'code'
  | 'reasoning'
  | 'function-calling'
  | 'long-context'
  | 'streaming'
  | 'batch'
  | 'self-hosted';

export interface ProviderAccess {
  /** Display name of the inference provider */
  provider: string;
  /** Classification of the provider type */
  type: ProviderType;
  /** Input price per 1 M tokens (USD) */
  inputPricePerMillion: number;
  /** Output price per 1 M tokens (USD) */
  outputPricePerMillion: number;
  notes?: string;
}

export interface BenchmarkScores {
  /** MMLU 5-shot accuracy (0–100) */
  mmlu?: number;
  /** HumanEval pass@1 (0–100) */
  humanEval?: number;
  /** MATH 4-shot chain-of-thought (0–100) */
  math?: number;
  /** GPQA Diamond (0–100) */
  gpqa?: number;
  /** MT-Bench composite (0–10) */
  mtBench?: number;
  /** BIG-Bench Hard (0–100) */
  bbh?: number;
  /** True when any score is extrapolated, not directly measured */
  estimated?: boolean;
}

export interface ModelEntry {
  id: string;
  /** Human-readable display name */
  name: string;
  /** Company that trained the model */
  provider: string;
  /** Short slug used for colour/icon lookup */
  providerSlug: string;
  /** Model family (e.g. "GPT-4", "Claude 3.5") */
  family: string;
  /** Capability tier classification */
  tier: ModelTier;
  /** Context window in tokens */
  contextWindow: number;
  /** Maximum output tokens */
  maxOutputTokens: number;
  /** Capabilities this model supports */
  capabilities: Capability[];
  /** Published benchmark results */
  benchmarks: BenchmarkScores;
  /** ISO date of general availability */
  releaseDate: string;
  /** Lifecycle status */
  status: ModelStatus;
  /** Optional notes / caveats */
  notes?: string;
  /**
   * Canonical (cheapest / most direct) pricing:
   * input price per 1 M tokens (USD)
   */
  inputPricePerMillion: number;
  /**
   * Canonical (cheapest / most direct) pricing:
   * output price per 1 M tokens (USD)
   */
  outputPricePerMillion: number;
  /**
   * All known ways to access this model with their respective pricing.
   * Enables dynamic provider discovery without hardcoding a single marketplace.
   */
  accessVia: ProviderAccess[];
}

// ── Derived helpers ───────────────────────────────────────────────────────────

/**
 * Blended cost per 1 M tokens assuming a typical workload where 70 % of
 * tokens are prompt (input) and 30 % are completion (output).
 */
export function blendedCost(model: ModelEntry, inputRatio = 0.70): number {
  return inputRatio * model.inputPricePerMillion + (1 - inputRatio) * model.outputPricePerMillion;
}

/** Return all unique providers that offer a given model. */
export function discoverProviders(model: ModelEntry): ProviderAccess[] {
  return model.accessVia;
}

/** Return the cheapest access route for a model. */
export function cheapestProvider(model: ModelEntry): ProviderAccess {
  return model.accessVia.reduce((best, p) =>
    blendedCost({ ...model, inputPricePerMillion: p.inputPricePerMillion, outputPricePerMillion: p.outputPricePerMillion })
      < blendedCost({ ...model, inputPricePerMillion: best.inputPricePerMillion, outputPricePerMillion: best.outputPricePerMillion })
      ? p : best
  );
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const MODELS: ModelEntry[] = [

  // ── OpenAI ───────────────────────────────────────────────────────────────

  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerSlug: 'openai',
    family: 'GPT-4',
    tier: 'frontier',
    inputPricePerMillion: 2.50,
    outputPricePerMillion: 10.00,
    contextWindow: 128_000,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 88.7,
      humanEval: 90.2,
      math: 76.6,
      gpqa: 53.6,
      mtBench: 9.3,
      bbh: 83.1,
    },
    releaseDate: '2024-05-13',
    status: 'ga',
    accessVia: [
      { provider: 'OpenAI API', type: 'native', inputPricePerMillion: 2.50, outputPricePerMillion: 10.00 },
      { provider: 'Azure OpenAI', type: 'azure', inputPricePerMillion: 2.50, outputPricePerMillion: 10.00, notes: 'Same price as OpenAI API' },
    ],
  },

  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    family: 'GPT-4',
    tier: 'efficient',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.60,
    contextWindow: 128_000,
    maxOutputTokens: 16_384,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 82.0,
      humanEval: 87.2,
      math: 70.2,
      gpqa: 40.2,
      mtBench: 8.8,
      bbh: 76.4,
    },
    releaseDate: '2024-07-18',
    status: 'ga',
    accessVia: [
      { provider: 'OpenAI API', type: 'native', inputPricePerMillion: 0.15, outputPricePerMillion: 0.60 },
      { provider: 'Azure OpenAI', type: 'azure', inputPricePerMillion: 0.15, outputPricePerMillion: 0.60 },
    ],
  },

  {
    id: 'o1',
    name: 'o1',
    provider: 'OpenAI',
    providerSlug: 'openai',
    family: 'OpenAI o-series',
    tier: 'frontier',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 60.00,
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    capabilities: ['chat', 'vision', 'code', 'reasoning', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 92.3,
      humanEval: 92.4,
      math: 96.4,
      gpqa: 77.3,
      mtBench: 9.5,
      bbh: 87.2,
    },
    releaseDate: '2024-12-05',
    status: 'ga',
    notes: 'Extended thinking time via internal chain-of-thought; billed tokens include reasoning tokens.',
    accessVia: [
      { provider: 'OpenAI API', type: 'native', inputPricePerMillion: 15.00, outputPricePerMillion: 60.00 },
      { provider: 'Azure OpenAI', type: 'azure', inputPricePerMillion: 15.00, outputPricePerMillion: 60.00 },
    ],
  },

  {
    id: 'o1-mini',
    name: 'o1-mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    family: 'OpenAI o-series',
    tier: 'standard',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 12.00,
    contextWindow: 128_000,
    maxOutputTokens: 65_536,
    capabilities: ['chat', 'code', 'reasoning', 'streaming'],
    benchmarks: {
      mmlu: 85.2,
      humanEval: 93.0,
      math: 90.0,
      gpqa: 60.0,
      mtBench: 9.0,
    },
    releaseDate: '2024-09-12',
    status: 'ga',
    notes: 'Reasoning-focused smaller model; strong STEM performance at lower cost than o1.',
    accessVia: [
      { provider: 'OpenAI API', type: 'native', inputPricePerMillion: 3.00, outputPricePerMillion: 12.00 },
    ],
  },

  {
    id: 'o3-mini',
    name: 'o3-mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    family: 'OpenAI o-series',
    tier: 'standard',
    inputPricePerMillion: 1.10,
    outputPricePerMillion: 4.40,
    contextWindow: 200_000,
    maxOutputTokens: 100_000,
    capabilities: ['chat', 'code', 'reasoning', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 86.9,
      humanEval: 93.7,
      math: 97.9,
      gpqa: 79.7,
      estimated: true,
    },
    releaseDate: '2025-01-31',
    status: 'ga',
    notes: 'Supports low/medium/high reasoning effort levels. Prices shown for medium effort.',
    accessVia: [
      { provider: 'OpenAI API', type: 'native', inputPricePerMillion: 1.10, outputPricePerMillion: 4.40 },
      { provider: 'Azure OpenAI', type: 'azure', inputPricePerMillion: 1.10, outputPricePerMillion: 4.40 },
    ],
  },

  {
    id: 'gpt-35-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    providerSlug: 'openai',
    family: 'GPT-3.5',
    tier: 'budget',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 1.50,
    contextWindow: 16_385,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 70.0,
      humanEval: 73.0,
      math: 34.1,
      gpqa: 29.0,
      mtBench: 7.9,
    },
    releaseDate: '2023-03-01',
    status: 'ga',
    accessVia: [
      { provider: 'OpenAI API', type: 'native', inputPricePerMillion: 0.50, outputPricePerMillion: 1.50 },
      { provider: 'Azure OpenAI', type: 'azure', inputPricePerMillion: 0.50, outputPricePerMillion: 1.50 },
    ],
  },

  // ── Anthropic ────────────────────────────────────────────────────────────

  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 4',
    tier: 'frontier',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'reasoning', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 91.5,
      humanEval: 94.0,
      math: 92.0,
      gpqa: 76.5,
      estimated: true,
    },
    releaseDate: '2025-09-01',
    status: 'ga',
    notes: 'Pricing and benchmarks estimated from Anthropic release materials; verify at anthropic.com/pricing.',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 15.00, outputPricePerMillion: 75.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 15.00, outputPricePerMillion: 75.00, notes: 'On-demand; no additional markup' },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 15.00, outputPricePerMillion: 75.00 },
    ],
  },

  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 4',
    tier: 'standard',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'reasoning', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 89.5,
      humanEval: 93.8,
      math: 87.0,
      gpqa: 68.0,
      estimated: true,
    },
    releaseDate: '2025-09-01',
    status: 'ga',
    notes: 'Currently available in Claude Code (this session). Pricing estimated from provider announcements.',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
    ],
  },

  {
    id: 'claude-haiku-4-5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 4',
    tier: 'efficient',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 83.5,
      humanEval: 88.0,
      math: 73.0,
      gpqa: 43.0,
      estimated: true,
    },
    releaseDate: '2025-10-01',
    status: 'ga',
    notes: 'Model ID: claude-haiku-4-5-20251001. Pricing estimated.',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 0.80, outputPricePerMillion: 4.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 0.80, outputPricePerMillion: 4.00 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 0.80, outputPricePerMillion: 4.00 },
    ],
  },

  {
    id: 'claude-35-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 3.5',
    tier: 'standard',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'reasoning', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 88.3,
      humanEval: 92.0,
      math: 71.1,
      gpqa: 65.0,
      mtBench: 9.3,
      bbh: 86.8,
    },
    releaseDate: '2024-10-22',
    status: 'ga',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
    ],
  },

  {
    id: 'claude-35-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 3.5',
    tier: 'efficient',
    inputPricePerMillion: 0.80,
    outputPricePerMillion: 4.00,
    contextWindow: 200_000,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 74.5,
      humanEval: 88.2,
      math: 59.0,
      gpqa: 41.6,
    },
    releaseDate: '2024-10-22',
    status: 'ga',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 0.80, outputPricePerMillion: 4.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 0.80, outputPricePerMillion: 4.00 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 0.80, outputPricePerMillion: 4.00 },
    ],
  },

  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 3',
    tier: 'frontier',
    inputPricePerMillion: 15.00,
    outputPricePerMillion: 75.00,
    contextWindow: 200_000,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 86.8,
      humanEval: 84.9,
      math: 60.1,
      gpqa: 50.4,
      mtBench: 9.0,
      bbh: 86.8,
    },
    releaseDate: '2024-03-04',
    status: 'ga',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 15.00, outputPricePerMillion: 75.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 15.00, outputPricePerMillion: 75.00 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 15.00, outputPricePerMillion: 75.00 },
    ],
  },

  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    family: 'Claude 3',
    tier: 'budget',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
    contextWindow: 200_000,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'streaming', 'batch'],
    benchmarks: {
      mmlu: 75.2,
      humanEval: 75.9,
      math: 38.9,
      gpqa: 33.3,
    },
    releaseDate: '2024-03-04',
    status: 'ga',
    accessVia: [
      { provider: 'Anthropic API', type: 'native', inputPricePerMillion: 0.25, outputPricePerMillion: 1.25 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 0.25, outputPricePerMillion: 1.25 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 0.25, outputPricePerMillion: 1.25 },
    ],
  },

  // ── Google ────────────────────────────────────────────────────────────────

  {
    id: 'gemini-25-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerSlug: 'google',
    family: 'Gemini 2',
    tier: 'frontier',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 10.00,
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    capabilities: ['chat', 'vision', 'code', 'reasoning', 'function-calling', 'long-context', 'streaming'],
    benchmarks: {
      mmlu: 91.0,
      humanEval: 90.5,
      math: 89.5,
      gpqa: 75.0,
      estimated: true,
    },
    releaseDate: '2025-03-25',
    status: 'ga',
    notes: 'Pricing: $1.25/M input ≤200K ctx; $2.50/M above. Benchmarks estimated from Google technical report.',
    accessVia: [
      { provider: 'Google AI Studio', type: 'native', inputPricePerMillion: 1.25, outputPricePerMillion: 10.00, notes: '≤200K context' },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 1.25, outputPricePerMillion: 10.00 },
    ],
  },

  {
    id: 'gemini-20-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    providerSlug: 'google',
    family: 'Gemini 2',
    tier: 'efficient',
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.40,
    contextWindow: 1_048_576,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'long-context', 'streaming'],
    benchmarks: {
      mmlu: 83.5,
      humanEval: 83.0,
      math: 78.0,
      gpqa: 51.0,
      estimated: true,
    },
    releaseDate: '2025-02-05',
    status: 'ga',
    accessVia: [
      { provider: 'Google AI Studio', type: 'native', inputPricePerMillion: 0.10, outputPricePerMillion: 0.40 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 0.10, outputPricePerMillion: 0.40 },
    ],
  },

  {
    id: 'gemini-15-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerSlug: 'google',
    family: 'Gemini 1.5',
    tier: 'standard',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.00,
    contextWindow: 2_097_152,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'long-context', 'streaming'],
    benchmarks: {
      mmlu: 85.9,
      humanEval: 84.1,
      math: 67.7,
      gpqa: 46.2,
      mtBench: 8.9,
      bbh: 84.0,
    },
    releaseDate: '2024-05-15',
    status: 'ga',
    notes: 'Pricing: $1.25/$5.00 for ≤128K context; $2.50/$10.00 above 128K.',
    accessVia: [
      { provider: 'Google AI Studio', type: 'native', inputPricePerMillion: 1.25, outputPricePerMillion: 5.00, notes: '≤128K context' },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 1.25, outputPricePerMillion: 5.00 },
    ],
  },

  {
    id: 'gemini-15-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    providerSlug: 'google',
    family: 'Gemini 1.5',
    tier: 'budget',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.30,
    contextWindow: 1_048_576,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'vision', 'code', 'function-calling', 'long-context', 'streaming'],
    benchmarks: {
      mmlu: 78.7,
      humanEval: 74.3,
      math: 54.9,
      gpqa: 39.5,
    },
    releaseDate: '2024-05-15',
    status: 'ga',
    notes: 'Pricing: $0.075/$0.30 for ≤128K context; $0.15/$0.60 above.',
    accessVia: [
      { provider: 'Google AI Studio', type: 'native', inputPricePerMillion: 0.075, outputPricePerMillion: 0.30 },
      { provider: 'Google Vertex AI', type: 'vertex', inputPricePerMillion: 0.075, outputPricePerMillion: 0.30 },
    ],
  },

  // ── Mistral AI ────────────────────────────────────────────────────────────

  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    providerSlug: 'mistral',
    family: 'Mistral Large',
    tier: 'standard',
    inputPricePerMillion: 2.00,
    outputPricePerMillion: 6.00,
    contextWindow: 131_072,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 84.0,
      humanEval: 92.0,
      math: 56.0,
      gpqa: 45.0,
      mtBench: 8.8,
    },
    releaseDate: '2024-07-24',
    status: 'ga',
    accessVia: [
      { provider: 'Mistral API', type: 'native', inputPricePerMillion: 2.00, outputPricePerMillion: 6.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 2.00, outputPricePerMillion: 6.00 },
      { provider: 'Azure AI', type: 'azure', inputPricePerMillion: 2.00, outputPricePerMillion: 6.00 },
    ],
  },

  {
    id: 'mistral-small-3',
    name: 'Mistral Small 3',
    provider: 'Mistral AI',
    providerSlug: 'mistral',
    family: 'Mistral Small',
    tier: 'budget',
    inputPricePerMillion: 0.10,
    outputPricePerMillion: 0.30,
    contextWindow: 32_768,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 81.0,
      humanEval: 83.0,
      math: 50.0,
      gpqa: 32.0,
      estimated: true,
    },
    releaseDate: '2025-01-30',
    status: 'ga',
    accessVia: [
      { provider: 'Mistral API', type: 'native', inputPricePerMillion: 0.10, outputPricePerMillion: 0.30 },
    ],
  },

  {
    id: 'mixtral-8x22b',
    name: 'Mixtral 8×22B Instruct',
    provider: 'Mistral AI',
    providerSlug: 'mistral',
    family: 'Mixtral',
    tier: 'standard',
    inputPricePerMillion: 1.20,
    outputPricePerMillion: 1.20,
    contextWindow: 65_536,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 77.8,
      humanEval: 75.4,
      math: 41.8,
      gpqa: 38.5,
    },
    releaseDate: '2024-04-17',
    status: 'ga',
    accessVia: [
      { provider: 'Mistral API', type: 'native', inputPricePerMillion: 1.20, outputPricePerMillion: 1.20 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 0.90, outputPricePerMillion: 0.90, notes: 'Slightly cheaper on Together AI' },
    ],
  },

  {
    id: 'mistral-7b',
    name: 'Mistral 7B Instruct v0.3',
    provider: 'Mistral AI',
    providerSlug: 'mistral',
    family: 'Mistral 7B',
    tier: 'budget',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 0.25,
    contextWindow: 32_768,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'streaming', 'self-hosted'],
    benchmarks: {
      mmlu: 60.1,
      humanEval: 43.0,
      math: 14.5,
      gpqa: 19.0,
    },
    releaseDate: '2024-05-22',
    status: 'ga',
    notes: 'Apache 2.0 open weights. Self-hosting can reduce cost below $0.05/M.',
    accessVia: [
      { provider: 'Mistral API', type: 'native', inputPricePerMillion: 0.25, outputPricePerMillion: 0.25 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 0.20, outputPricePerMillion: 0.20 },
      { provider: 'Groq', type: 'groq', inputPricePerMillion: 0.05, outputPricePerMillion: 0.08, notes: 'Fast inference, usage-based pricing' },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.02, outputPricePerMillion: 0.02, notes: 'Estimated infra cost on A100 cloud GPU' },
    ],
  },

  // ── Meta Llama ───────────────────────────────────────────────────────────

  {
    id: 'llama-31-405b',
    name: 'Llama 3.1 405B Instruct',
    provider: 'Meta',
    providerSlug: 'meta',
    family: 'Llama 3.1',
    tier: 'frontier',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 3.00,
    contextWindow: 131_072,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'function-calling', 'streaming', 'self-hosted'],
    benchmarks: {
      mmlu: 88.6,
      humanEval: 89.0,
      math: 73.8,
      gpqa: 51.1,
      bbh: 85.9,
    },
    releaseDate: '2024-07-23',
    status: 'ga',
    notes: 'Open weights (Llama 3.1 Community License). Price via Fireworks AI. Self-hosting available.',
    accessVia: [
      { provider: 'Fireworks AI', type: 'fireworks', inputPricePerMillion: 3.00, outputPricePerMillion: 3.00 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 3.50, outputPricePerMillion: 3.50 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 5.32, outputPricePerMillion: 16.00, notes: 'AWS per-token pricing' },
      { provider: 'Replicate', type: 'replicate', inputPricePerMillion: 2.70, outputPricePerMillion: 2.70 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.50, outputPricePerMillion: 0.50, notes: 'Estimated 8×A100 SXM4 80GB cluster' },
    ],
  },

  {
    id: 'llama-33-70b',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    providerSlug: 'meta',
    family: 'Llama 3.3',
    tier: 'standard',
    inputPricePerMillion: 0.59,
    outputPricePerMillion: 0.79,
    contextWindow: 131_072,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'function-calling', 'streaming', 'self-hosted'],
    benchmarks: {
      mmlu: 86.0,
      humanEval: 85.7,
      math: 77.0,
      gpqa: 50.5,
    },
    releaseDate: '2024-12-06',
    status: 'ga',
    notes: 'Open weights. Strong performance-to-cost ratio; popular self-hosted choice.',
    accessVia: [
      { provider: 'Fireworks AI', type: 'fireworks', inputPricePerMillion: 0.59, outputPricePerMillion: 0.79 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 0.90, outputPricePerMillion: 0.90 },
      { provider: 'Groq', type: 'groq', inputPricePerMillion: 0.59, outputPricePerMillion: 0.79 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 0.72, outputPricePerMillion: 0.99 },
      { provider: 'Replicate', type: 'replicate', inputPricePerMillion: 0.65, outputPricePerMillion: 0.65 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.08, outputPricePerMillion: 0.08, notes: 'Single A100 GPU estimated cost' },
    ],
  },

  {
    id: 'llama-31-8b',
    name: 'Llama 3.1 8B Instruct',
    provider: 'Meta',
    providerSlug: 'meta',
    family: 'Llama 3.1',
    tier: 'budget',
    inputPricePerMillion: 0.18,
    outputPricePerMillion: 0.18,
    contextWindow: 131_072,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'streaming', 'self-hosted'],
    benchmarks: {
      mmlu: 73.0,
      humanEval: 72.6,
      math: 51.9,
      gpqa: 28.1,
    },
    releaseDate: '2024-07-23',
    status: 'ga',
    accessVia: [
      { provider: 'Fireworks AI', type: 'fireworks', inputPricePerMillion: 0.18, outputPricePerMillion: 0.18 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 0.20, outputPricePerMillion: 0.20 },
      { provider: 'Groq', type: 'groq', inputPricePerMillion: 0.05, outputPricePerMillion: 0.08 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.01, outputPricePerMillion: 0.01, notes: 'Consumer GPU (RTX 4090) estimated cost' },
    ],
  },

  // ── Cohere ────────────────────────────────────────────────────────────────

  {
    id: 'cohere-command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    providerSlug: 'cohere',
    family: 'Command R',
    tier: 'standard',
    inputPricePerMillion: 3.00,
    outputPricePerMillion: 15.00,
    contextWindow: 128_000,
    maxOutputTokens: 4_000,
    capabilities: ['chat', 'code', 'reasoning', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 75.7,
      humanEval: 73.8,
      math: 54.5,
      gpqa: 30.0,
    },
    releaseDate: '2024-04-04',
    status: 'ga',
    notes: 'Optimised for enterprise RAG and grounded generation workflows.',
    accessVia: [
      { provider: 'Cohere API', type: 'native', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 3.00, outputPricePerMillion: 15.00 },
    ],
  },

  {
    id: 'cohere-command-r',
    name: 'Command R',
    provider: 'Cohere',
    providerSlug: 'cohere',
    family: 'Command R',
    tier: 'budget',
    inputPricePerMillion: 0.50,
    outputPricePerMillion: 1.50,
    contextWindow: 128_000,
    maxOutputTokens: 4_000,
    capabilities: ['chat', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 68.2,
      humanEval: 65.0,
      math: 43.0,
      gpqa: 22.0,
    },
    releaseDate: '2024-03-11',
    status: 'ga',
    accessVia: [
      { provider: 'Cohere API', type: 'native', inputPricePerMillion: 0.50, outputPricePerMillion: 1.50 },
      { provider: 'AWS Bedrock', type: 'bedrock', inputPricePerMillion: 0.50, outputPricePerMillion: 1.50 },
    ],
  },

  // ── DeepSeek ──────────────────────────────────────────────────────────────

  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerSlug: 'deepseek',
    family: 'DeepSeek V',
    tier: 'standard',
    inputPricePerMillion: 0.27,
    outputPricePerMillion: 1.10,
    contextWindow: 65_536,
    maxOutputTokens: 8_192,
    capabilities: ['chat', 'code', 'function-calling', 'streaming'],
    benchmarks: {
      mmlu: 87.1,
      humanEval: 82.6,
      math: 75.9,
      gpqa: 59.1,
      bbh: 87.5,
    },
    releaseDate: '2024-12-26',
    status: 'ga',
    notes: 'Mixture-of-Experts 671B total / 37B active. Exceptional price-to-quality. Open weights.',
    accessVia: [
      { provider: 'DeepSeek API', type: 'native', inputPricePerMillion: 0.27, outputPricePerMillion: 1.10 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 0.50, outputPricePerMillion: 1.00 },
      { provider: 'Fireworks AI', type: 'fireworks', inputPricePerMillion: 0.50, outputPricePerMillion: 1.50 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.10, outputPricePerMillion: 0.10, notes: 'FP8 quantised on 8×H100' },
    ],
  },

  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerSlug: 'deepseek',
    family: 'DeepSeek R',
    tier: 'frontier',
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    contextWindow: 65_536,
    maxOutputTokens: 32_768,
    capabilities: ['chat', 'code', 'reasoning', 'streaming'],
    benchmarks: {
      mmlu: 90.8,
      humanEval: 92.6,
      math: 97.3,
      gpqa: 71.5,
    },
    releaseDate: '2025-01-20',
    status: 'ga',
    notes: 'Open-weights reasoning model. AIME-2024: 79.8%. Competes with o1 at a fraction of the cost.',
    accessVia: [
      { provider: 'DeepSeek API', type: 'native', inputPricePerMillion: 0.55, outputPricePerMillion: 2.19 },
      { provider: 'Together AI', type: 'together', inputPricePerMillion: 1.20, outputPricePerMillion: 1.20 },
      { provider: 'Fireworks AI', type: 'fireworks', inputPricePerMillion: 0.80, outputPricePerMillion: 2.40 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.20, outputPricePerMillion: 0.20, notes: 'FP8 on 8×H100' },
    ],
  },

  // ── Microsoft Phi ────────────────────────────────────────────────────────

  {
    id: 'phi-35-mini',
    name: 'Phi-3.5 Mini Instruct',
    provider: 'Microsoft',
    providerSlug: 'microsoft',
    family: 'Phi-3.5',
    tier: 'budget',
    inputPricePerMillion: 0.13,
    outputPricePerMillion: 0.13,
    contextWindow: 131_072,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'streaming', 'self-hosted'],
    benchmarks: {
      mmlu: 69.0,
      humanEval: 62.0,
      math: 37.5,
      gpqa: 27.0,
    },
    releaseDate: '2024-08-22',
    status: 'ga',
    notes: '3.8B parameter model. MIT licence. Excellent for edge/local deployment.',
    accessVia: [
      { provider: 'Azure AI', type: 'azure', inputPricePerMillion: 0.13, outputPricePerMillion: 0.13 },
      { provider: 'Groq', type: 'groq', inputPricePerMillion: 0.05, outputPricePerMillion: 0.05 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.005, outputPricePerMillion: 0.005, notes: 'Runs on M2 MacBook Air' },
    ],
  },

  {
    id: 'phi-35-moe',
    name: 'Phi-3.5 MoE Instruct',
    provider: 'Microsoft',
    providerSlug: 'microsoft',
    family: 'Phi-3.5',
    tier: 'efficient',
    inputPricePerMillion: 0.18,
    outputPricePerMillion: 0.18,
    contextWindow: 131_072,
    maxOutputTokens: 4_096,
    capabilities: ['chat', 'code', 'streaming', 'self-hosted'],
    benchmarks: {
      mmlu: 78.9,
      humanEval: 76.6,
      math: 58.0,
      gpqa: 35.0,
    },
    releaseDate: '2024-08-22',
    status: 'ga',
    notes: '42B total / 6.6B active parameters MoE. MIT licence.',
    accessVia: [
      { provider: 'Azure AI', type: 'azure', inputPricePerMillion: 0.18, outputPricePerMillion: 0.18 },
      { provider: 'Self-hosted', type: 'self-hosted', inputPricePerMillion: 0.02, outputPricePerMillion: 0.02 },
    ],
  },
];

// ── Provider colour mapping ───────────────────────────────────────────────────

export const PROVIDER_COLORS: Record<string, string> = {
  openai:    '#10a37f',
  anthropic: '#d97706',
  google:    '#4285f4',
  mistral:   '#7c3aed',
  meta:      '#0866ff',
  cohere:    '#39b5e0',
  deepseek:  '#0ea5e9',
  microsoft: '#00adef',
};

export const PROVIDER_LABELS: Record<string, string> = {
  openai:    'OpenAI',
  anthropic: 'Anthropic',
  google:    'Google',
  mistral:   'Mistral AI',
  meta:      'Meta',
  cohere:    'Cohere',
  deepseek:  'DeepSeek',
  microsoft: 'Microsoft',
};

/** All unique provider slugs in the registry */
export const ALL_PROVIDERS = Array.from(new Set(MODELS.map(m => m.providerSlug)));

/** All unique tiers in the registry */
export const ALL_TIERS: ModelTier[] = ['frontier', 'standard', 'efficient', 'budget'];
