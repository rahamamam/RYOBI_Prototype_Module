/**
 * Type model for the orchestrator simulation.
 *
 * The design intent: a *scenario* is pure data. The engine derives every
 * artifact (Sprout payload, Claude request, Claude response, delivery payload)
 * from that data at run time. Nothing shown to the user is a hand-written
 * string pretending to be an API response — change the scenario or the model
 * routing and all five stages recompute.
 */

export type StageId = 'pull' | 'package' | 'reason' | 'format' | 'deliver';

export type LayerId = 'data' | 'orchestrator' | 'reasoning' | 'decision';

export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'cross';

export type Pillar =
  | 'Awareness'
  | 'Engagement'
  | 'Audience Growth'
  | 'Video Performance'
  | 'Content Performance'
  | 'Community Health';

export type ModelId = 'haiku-4-5' | 'sonnet';

export type Severity = 'opportunity' | 'watch' | 'alert';

export type FaultId =
  | 'sprout-429'
  | 'sprout-schema'
  | 'claude-overloaded'
  | 'low-confidence';

export type LogKind = 'info' | 'ok' | 'warn' | 'error' | 'pending';

export type Verdict = 'approved' | 'revision' | 'rejected';

/** One line of orchestrator output, stamped with simulated elapsed time. */
export interface RunEvent {
  id: number;
  t: number;
  stage: StageId;
  kind: LogKind;
  text: string;
}

/** Everything the engine derives for a single stage of a run. */
export interface StageResult {
  stage: StageId;
  events: RunEvent[];
  /** Simulated wall-clock duration for the stage, in ms. */
  durationMs: number;
  /** The artifact the centre panel renders when this stage is active. */
  artifact: Artifact;
  /** True when a fault degraded this stage but the run continued. */
  degraded: boolean;
}

export type Artifact =
  | { kind: 'code'; title: string; badge: string; language: 'json' | 'http'; code: string }
  | { kind: 'brief' };

export interface TokenUsage {
  input: number;
  output: number;
}

export interface RunTrace {
  scenarioId: string;
  model: ModelId;
  batch: boolean;
  faults: FaultId[];
  stages: StageResult[];
  /** Total simulated pipeline latency in ms. */
  totalMs: number;
  usage: TokenUsage;
  /** Cost of this single run in USD. */
  costUsd: number;
  retries: number;
  /** Confidence Claude reports on its own synthesis, 0–1. */
  confidence: number;
  /** False when the governance gate holds the brief back from delivery. */
  passedGate: boolean;
  gateReason: string | null;
  /** Analyst-hours the same synthesis would take by hand. */
  manualHours: number;
}

/* ------------------------------------------------------------------ */
/* Scenario data — the input side of the simulation                    */
/* ------------------------------------------------------------------ */

export interface SproutMetric {
  key: string;
  value: number | string;
  wow?: string;
  note?: string;
}

export interface Finding {
  whatMoved: string;
  whyItMoved: string;
  whatItMeans: string;
  actions: string[];
  severity: Severity;
}

export interface Scenario {
  id: string;
  label: string;
  /** One-line framing shown in the scenario picker. */
  tagline: string;
  pillar: Pillar;
  platforms: Platform[];
  /** Cadence this scenario would run on in production. */
  cadence: 'daily' | 'weekly' | 'monthly';
  /** Sprout Analytics API endpoints the orchestrator would call. */
  endpoints: string[];
  /** The raw, pre-reasoning numbers — this is what a dashboard alone shows. */
  metrics: SproutMetric[];
  /** Listening-layer payload. */
  listening: {
    topics: string[];
    mentions: number;
    sentiment: { positive: number; neutral: number; negative: number };
    sampleComments: string[];
  };
  /** Competitive layer payload. */
  competitors: {
    shareOfVoice: Record<string, number>;
    trend: string;
  };
  /** The headline a dashboard would render, unaided. */
  dashboardReading: string;
  /** What the reasoning layer concludes instead. */
  finding: Finding;
  /** Baseline confidence before any fault is injected. */
  baseConfidence: number;
  /** Analyst-hours to reproduce this synthesis manually. */
  manualHours: number;
  /** Slack channel the brief is routed to. */
  channel: string;
  /** Delivery time stamp shown on the brief. */
  deliveredAt: string;
}
