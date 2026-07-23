import type { ModelId } from './types';

/**
 * Model pricing used by the cost meter.
 *
 * Rates are USD per million tokens, as published for the models named in the
 * solution design. Figures are converted to CAD at the same 1.41 rate the
 * report's Appendix D uses, so the numbers here reconcile with the budget
 * tables rather than floating free of them.
 */
export const USD_TO_CAD = 1.41;

export interface ModelSpec {
  id: ModelId;
  name: string;
  /** USD per million input tokens. */
  inputRate: number;
  /** USD per million output tokens. */
  outputRate: number;
  /** Simulated API latency band, in ms. */
  latency: [number, number];
  /** Rough output-length multiplier — the larger model reasons at more length. */
  verbosity: number;
  role: string;
}

export const MODELS: Record<ModelId, ModelSpec> = {
  'haiku-4-5': {
    id: 'haiku-4-5',
    name: 'Claude Haiku 4.5',
    inputRate: 1,
    outputRate: 5,
    latency: [900, 1400],
    verbosity: 1,
    role: 'Daily and weekly digest pipeline',
  },
  sonnet: {
    id: 'sonnet',
    name: 'Claude Sonnet',
    inputRate: 3,
    outputRate: 15,
    latency: [1900, 2800],
    verbosity: 1.6,
    role: 'Monthly strategic report',
  },
};

/** Batch API pricing discount, applied when the run is not time-critical. */
export const BATCH_DISCOUNT = 0.5;

/**
 * Token estimate from character count. Four characters per token is the
 * conventional English-text approximation and is accurate enough for a cost
 * model whose purpose is order-of-magnitude, not invoicing.
 */
export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

export function costOf(
  model: ModelId,
  usage: { input: number; output: number },
  batch: boolean,
): number {
  const spec = MODELS[model];
  const raw =
    (usage.input / 1_000_000) * spec.inputRate +
    (usage.output / 1_000_000) * spec.outputRate;
  return batch ? raw * BATCH_DISCOUNT : raw;
}

/** Runs per year for each production cadence, across the six KPI pillars. */
export const CADENCE_RUNS = {
  daily: 365 * 6,
  weekly: 52 * 6,
  monthly: 12,
} as const;

/**
 * Production payload scale.
 *
 * The scenario payloads in this simulation are deliberately trimmed so they
 * stay readable on screen — a few sample comments rather than the full corpus,
 * one window rather than a rolling history. A production call carries far more:
 * the complete comment and mention set for the window, the full competitor
 * benchmark table, and prior-period context for comparison.
 *
 * These multipliers scale the demo payload up to a realistic production size so
 * the annual figures mean something. They are the single largest assumption in
 * the cost model, which is why they are stated here and made adjustable in the
 * interface rather than buried.
 */
export const PRODUCTION_SCALE = {
  daily: { input: 26, output: 2.6 },
  weekly: { input: 66, output: 5 },
  monthly: { input: 140, output: 9 },
} as const;

/** The Claude API line item in Appendix D, Table D1 (CAD). */
export const BUDGET_API_LINE_CAD = 1680;

/** Blended internal analyst rate used for the hours-reclaimed valuation (CAD). */
export const ANALYST_RATE_CAD = 45;

export const fmtUsd = (n: number): string =>
  n < 0.01 ? `$${n.toFixed(4)}` : n < 1 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`;

export const fmtCad = (n: number): string =>
  n < 1
    ? `$${n.toFixed(2)}`
    : `$${n.toLocaleString('en-CA', { maximumFractionDigits: 0 })}`;
