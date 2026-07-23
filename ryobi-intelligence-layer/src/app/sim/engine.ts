import type {
  Artifact,
  FaultId,
  ModelId,
  RunEvent,
  RunTrace,
  Scenario,
  StageId,
  StageResult,
} from './types';
import { MODELS, costOf, estimateTokens } from './pricing';

/* ------------------------------------------------------------------ */
/* Stage metadata                                                      */
/* ------------------------------------------------------------------ */

export interface StageMeta {
  id: StageId;
  index: number;
  short: string;
  label: string;
  actor: string;
  layer: 'data' | 'orchestrator' | 'reasoning' | 'decision';
}

export const STAGES: StageMeta[] = [
  { id: 'pull', index: 0, short: 'PULL', label: 'Pull', actor: 'Sprout Analytics API', layer: 'data' },
  { id: 'package', index: 1, short: 'PACKAGE', label: 'Package for Claude', actor: 'Orchestrator', layer: 'orchestrator' },
  { id: 'reason', index: 2, short: 'REASON', label: 'Reason', actor: 'Claude API', layer: 'reasoning' },
  { id: 'format', index: 3, short: 'FORMAT', label: 'Package for team', actor: 'Orchestrator', layer: 'orchestrator' },
  { id: 'deliver', index: 4, short: 'DELIVER', label: 'Deliver', actor: 'RYOBI marketing', layer: 'decision' },
];

export const STAGE_ORDER: StageId[] = STAGES.map((s) => s.id);

/* ------------------------------------------------------------------ */
/* Fault catalogue                                                     */
/* ------------------------------------------------------------------ */

export interface FaultSpec {
  id: FaultId;
  label: string;
  stage: StageId;
  /** What this fault is standing in for in the risk register. */
  risk: string;
  /** How the system is designed to absorb it. */
  mitigation: string;
}

export const FAULTS: FaultSpec[] = [
  {
    id: 'sprout-429',
    label: 'Sprout API rate limit (429)',
    stage: 'pull',
    risk: 'Vendor throttling during a high-volume window',
    mitigation: 'Exponential backoff and retry inside the orchestrator; the run completes late rather than failing',
  },
  {
    id: 'sprout-schema',
    label: 'TikTok schema change (missing field)',
    stage: 'pull',
    risk: 'Breaking platform API change — the maintenance exposure that ruled out Option C',
    mitigation: 'Partial-data degradation: the run continues on the fields that resolved, flags the gap, and lowers reported confidence',
  },
  {
    id: 'claude-overloaded',
    label: 'Claude API overloaded (529)',
    stage: 'reason',
    risk: 'Upstream capacity pressure on the reasoning endpoint',
    mitigation: 'Retry with jitter; the digest is late, never wrong',
  },
  {
    id: 'low-confidence',
    label: 'Low-confidence synthesis',
    stage: 'reason',
    risk: 'AI hallucination or unsupported inference — Risk 1 in the report',
    mitigation: 'The governance gate holds the brief below the 0.60 threshold and routes it for human review instead of delivering it',
  },
];

/** Confidence below which the governance gate refuses to deliver unreviewed. */
export const CONFIDENCE_THRESHOLD = 0.6;

/* ------------------------------------------------------------------ */
/* Artifact derivation — every payload is computed from scenario data  */
/* ------------------------------------------------------------------ */

const j = (value: unknown): string => JSON.stringify(value, null, 2);

export function buildSproutPayload(scenario: Scenario, schemaFault: boolean) {
  const metrics: Record<string, unknown> = {};
  for (const m of scenario.metrics) {
    // The schema fault drops the first metric, exactly as a renamed upstream
    // field would present to a consumer that was not updated.
    if (schemaFault && m.key === scenario.metrics[0].key) continue;
    metrics[m.key] = m.wow ? { value: m.value, wow: m.wow } : m.value;
  }

  return {
    profile: 'RYOBI',
    window: '2026-07-22T00:00:00Z/2026-07-23T00:00:00Z',
    pillar: scenario.pillar,
    platforms: scenario.platforms,
    metrics,
    listening: {
      topics: scenario.listening.topics,
      mentions: scenario.listening.mentions,
      sentiment: scenario.listening.sentiment,
      sample_comments: scenario.listening.sampleComments,
    },
    competitors: {
      share_of_voice: scenario.competitors.shareOfVoice,
      trend: scenario.competitors.trend,
    },
    ...(schemaFault
      ? { _warnings: [`field "${scenario.metrics[0].key}" absent from upstream response`] }
      : {}),
  };
}

export function buildClaudeRequest(scenario: Scenario, model: ModelId, batch: boolean) {
  return {
    model: MODELS[model].id === 'haiku-4-5' ? 'claude-haiku-4-5' : 'claude-sonnet-4-5',
    max_tokens: 1024,
    ...(batch ? { _endpoint: '/v1/messages/batches' } : {}),
    system: [
      "You are RYOBI's marketing analyst.",
      'Report against the six KPI pillars: Awareness, Engagement, Audience Growth,',
      'Video Performance, Content Performance, Community Health.',
      'Separate purchase-intent from engagement volume. Flag content gaps.',
      'State a calibrated confidence. Never recommend autonomous publishing.',
      'Respond with JSON only.',
    ].join(' '),
    messages: [
      {
        role: 'user',
        content:
          `Synthesise the ${scenario.pillar} signal for ${scenario.cadence} delivery. ` +
          'Sprout payload attached.\n\n<sprout_data>{ ...normalised metrics + listening + competitors... }</sprout_data>',
      },
    ],
  };
}

export function buildClaudeResponse(scenario: Scenario, confidence: number, degraded: boolean) {
  return {
    pillar: scenario.pillar,
    what_moved: scenario.finding.whatMoved,
    why_it_moved: scenario.finding.whyItMoved,
    what_it_means: scenario.finding.whatItMeans,
    recommended_actions: scenario.finding.actions,
    severity: scenario.finding.severity,
    confidence: Number(confidence.toFixed(2)),
    ...(degraded ? { data_completeness: 'partial', caveat: 'one upstream metric unavailable' } : {}),
    requires_human_review: true,
    auto_publish: false,
  };
}

export function buildDeliveryPayload(scenario: Scenario, confidence: number) {
  return {
    channel: scenario.channel,
    blocks: [
      { type: 'header', text: `Daily Brief \u2014 ${scenario.pillar} \u00b7 ${scenario.platforms.join(', ')}` },
      { type: 'section', text: `*What moved* \u2014 ${scenario.finding.whatMoved}` },
      { type: 'section', text: `*Why* \u2014 ${scenario.finding.whyItMoved}` },
      { type: 'section', text: `*What it means* \u2014 ${scenario.finding.whatItMeans}` },
      {
        type: 'actions',
        elements: scenario.finding.actions.map((a, i) => ({ type: 'item', index: i + 1, text: a })),
      },
      {
        type: 'context',
        text: `Recommendation only \u00b7 confidence ${confidence.toFixed(2)} \u00b7 awaiting human approval`,
      },
    ],
    fanout: {
      slack: 5,
      email_cc: ['3 Sprout seats', '2 non-seat marketers'],
      scheduled_pdf: 'weekly digest, up to 25 recipients',
    },
    auto_post: false,
  };
}

/* ------------------------------------------------------------------ */
/* The engine                                                          */
/* ------------------------------------------------------------------ */

export interface RunConfig {
  scenario: Scenario;
  model: ModelId;
  batch: boolean;
  faults: FaultId[];
}

export function runPipeline({ scenario, model, batch, faults }: RunConfig): RunTrace {
  const has = (f: FaultId) => faults.includes(f);
  const spec = MODELS[model];

  let id = 0;
  let clock = 0;
  let retries = 0;

  const stages: StageResult[] = [];

  const ev = (stage: StageId, kind: RunEvent['kind'], text: string, dt: number): RunEvent => {
    clock += dt;
    return { id: id++, t: clock, stage, kind, text };
  };

  /* --- Stage 1: pull ---------------------------------------------- */
  const schemaFault = has('sprout-schema');
  const pullEvents: RunEvent[] = [];
  const pullStart = clock;

  pullEvents.push(ev('pull', 'info', 'auth \u2192 OAuth2 client credentials exchanged', 120));
  pullEvents.push(ev('pull', 'ok', 'token accepted \u00b7 scope=analytics.read listening.read', 90));

  if (has('sprout-429')) {
    pullEvents.push(ev('pull', 'error', `GET ${scenario.endpoints[0]} \u2192 429 Too Many Requests`, 260));
    pullEvents.push(ev('pull', 'warn', 'backoff 1 \u00b7 sleeping 2,000ms before retry', 240));
    retries += 1;
    pullEvents.push(ev('pull', 'warn', 'backoff 2 \u00b7 sleeping 4,000ms before retry', 2000));
    retries += 1;
    pullEvents.push(ev('pull', 'ok', 'retry succeeded \u00b7 rate limit cleared', 4000));
  }

  scenario.endpoints.forEach((endpoint, i) => {
    pullEvents.push(ev('pull', 'info', `GET ${endpoint}`, 180));
    if (schemaFault && i === 0) {
      pullEvents.push(
        ev('pull', 'warn', `200 OK \u00b7 field "${scenario.metrics[0].key}" missing from response`, 260),
      );
      pullEvents.push(
        ev('pull', 'warn', 'schema drift detected \u2192 continuing on resolved fields', 140),
      );
    } else {
      pullEvents.push(ev('pull', 'ok', `200 OK \u00b7 ${payloadNote(scenario, i)}`, 240));
    }
  });

  const sproutPayload = buildSproutPayload(scenario, schemaFault);
  pullEvents.push(
    ev('pull', 'ok', `${scenario.endpoints.length} responses collected \u00b7 ${scenario.listening.mentions} mentions attached`, 150),
  );

  stages.push({
    stage: 'pull',
    events: pullEvents,
    durationMs: clock - pullStart,
    degraded: schemaFault,
    artifact: {
      kind: 'code',
      title: 'sprout_response.json',
      badge: 'RAW \u00b7 SPROUT SOCIAL',
      language: 'json',
      code: j(sproutPayload),
    },
  });

  /* --- Stage 2: package ------------------------------------------- */
  const packageEvents: RunEvent[] = [];
  const packageStart = clock;

  packageEvents.push(
    ev('package', 'info', `normalising ${scenario.endpoints.length} payloads \u2192 single object`, 110),
  );
  packageEvents.push(ev('package', 'info', 'merging metrics + listening + competitor layers', 130));
  if (schemaFault) {
    packageEvents.push(
      ev('package', 'warn', 'annotating payload: data_completeness=partial', 100),
    );
  }
  packageEvents.push(
    ev('package', 'info', 'attaching system prompt \u00b7 KPI pillars, brand voice, guardrails', 140),
  );
  packageEvents.push(
    ev('package', 'info', `routing model \u2192 ${spec.name}${batch ? ' (Batch API)' : ''}`, 90),
  );

  const requestObj = buildClaudeRequest(scenario, model, batch);
  const requestCode = `POST https://api.anthropic.com/v1/messages\n${j(requestObj)}`;
  // Only the content that is actually tokenised counts: the system prompt, the
  // user message, and the payload embedded in it. Envelope fields such as
  // `model`, `max_tokens`, and the batch routing annotation are not prompt
  // tokens, so counting them would make the Batch API appear to change the
  // input size — which it does not.
  const promptText = requestObj.system + requestObj.messages[0].content + j(sproutPayload);
  const inputTokens = estimateTokens(promptText);

  packageEvents.push(
    ev('package', 'ok', `request assembled \u00b7 ~${inputTokens.toLocaleString()} input tokens`, 120),
  );

  stages.push({
    stage: 'package',
    events: packageEvents,
    durationMs: clock - packageStart,
    degraded: schemaFault,
    artifact: {
      kind: 'code',
      title: 'claude_request.http',
      badge: 'ORCHESTRATOR \u2192 CLAUDE',
      language: 'http',
      code: requestCode,
    },
  });

  /* --- Stage 3: reason -------------------------------------------- */
  const reasonEvents: RunEvent[] = [];
  const reasonStart = clock;

  let confidence = scenario.baseConfidence;
  if (schemaFault) confidence -= 0.14;
  if (has('low-confidence')) confidence = 0.41;
  if (model === 'sonnet' && !has('low-confidence')) confidence = Math.min(0.95, confidence + 0.05);
  confidence = Math.max(0.05, Math.min(0.99, confidence));

  if (has('claude-overloaded')) {
    reasonEvents.push(ev('reason', 'error', 'POST /v1/messages \u2192 529 Overloaded', 320));
    reasonEvents.push(ev('reason', 'warn', 'retry 1 with jitter \u00b7 sleeping 1,500ms', 200));
    retries += 1;
    reasonEvents.push(ev('reason', 'ok', 'retry accepted \u00b7 capacity available', 1500));
  }

  const latency = Math.round((spec.latency[0] + spec.latency[1]) / 2);
  reasonEvents.push(
    ev('reason', 'info', `POST /v1/messages \u00b7 model=${requestObj.model}`, 180),
  );
  reasonEvents.push(ev('reason', 'pending', 'streaming response\u2026', Math.round(latency * 0.55)));
  reasonEvents.push(
    ev('reason', 'info', `separating ${signalNote(scenario)}`, Math.round(latency * 0.25)),
  );
  reasonEvents.push(
    ev('reason', 'info', `severity classified \u2192 ${scenario.finding.severity}`, Math.round(latency * 0.2)),
  );

  const responseObj = buildClaudeResponse(scenario, confidence, schemaFault);
  const responseCode = j(responseObj);
  const outputTokens = Math.round(estimateTokens(responseCode) * spec.verbosity);
  const usage = { input: inputTokens, output: outputTokens };
  const costUsd = costOf(model, usage, batch);

  reasonEvents.push(
    ev(
      'reason',
      'ok',
      `synthesis complete \u00b7 ~${outputTokens.toLocaleString()} output tokens \u00b7 $${costUsd.toFixed(4)}`,
      140,
    ),
  );
  reasonEvents.push(
    ev(
      'reason',
      confidence < CONFIDENCE_THRESHOLD ? 'warn' : 'info',
      `self-reported confidence ${confidence.toFixed(2)}`,
      90,
    ),
  );

  stages.push({
    stage: 'reason',
    events: reasonEvents,
    durationMs: clock - reasonStart,
    degraded: schemaFault || confidence < CONFIDENCE_THRESHOLD,
    artifact: {
      kind: 'code',
      title: 'claude_response.json',
      badge: 'RAW \u00b7 CLAUDE',
      language: 'json',
      code: responseCode,
    },
  });

  /* --- Stage 4: format + governance gate --------------------------- */
  const formatEvents: RunEvent[] = [];
  const formatStart = clock;
  const passedGate = confidence >= CONFIDENCE_THRESHOLD;
  const gateReason = passedGate
    ? null
    : `Confidence ${confidence.toFixed(2)} is below the ${CONFIDENCE_THRESHOLD.toFixed(2)} delivery threshold.`;

  formatEvents.push(ev('format', 'info', 'parsing claude_response.json', 110));
  formatEvents.push(
    ev('format', 'info', `governance gate \u00b7 threshold ${CONFIDENCE_THRESHOLD.toFixed(2)}`, 120),
  );

  if (!passedGate) {
    formatEvents.push(
      ev('format', 'error', `gate HELD \u00b7 confidence ${confidence.toFixed(2)} below threshold`, 160),
    );
    formatEvents.push(
      ev('format', 'warn', 'brief withheld from channel \u00b7 routed to review queue', 140),
    );
    formatEvents.push(
      ev('format', 'ok', 'no unreviewed output reached the team \u2014 by design', 120),
    );
  } else {
    formatEvents.push(ev('format', 'ok', `gate PASSED \u00b7 confidence ${confidence.toFixed(2)}`, 150));
    formatEvents.push(ev('format', 'info', 'mapping fields \u2192 Slack Block Kit', 160));
    formatEvents.push(
      ev('format', 'info', `routing \u2192 ${scenario.channel} + email cc (5)`, 130),
    );
    formatEvents.push(ev('format', 'ok', 'payload built \u00b7 auto_post=false enforced', 120));
  }

  stages.push({
    stage: 'format',
    events: formatEvents,
    durationMs: clock - formatStart,
    degraded: !passedGate,
    artifact: {
      kind: 'code',
      title: passedGate ? 'slack_delivery.http' : 'gate_hold.json',
      badge: passedGate ? 'ORCHESTRATOR \u2192 SLACK' : 'GOVERNANCE \u00b7 HELD',
      language: passedGate ? 'http' : 'json',
      code: passedGate
        ? `POST https://slack.com/api/chat.postMessage\n${j(buildDeliveryPayload(scenario, confidence))}`
        : j({
            delivered: false,
            reason: gateReason,
            threshold: CONFIDENCE_THRESHOLD,
            reported_confidence: Number(confidence.toFixed(2)),
            routed_to: 'human review queue',
            channel_posted: null,
            note: 'The pipeline is designed to be late rather than wrong. A held brief is a working control, not a failure.',
          }),
    },
  });

  /* --- Stage 5: deliver -------------------------------------------- */
  const deliverEvents: RunEvent[] = [];
  const deliverStart = clock;

  if (passedGate) {
    deliverEvents.push(
      ev('deliver', 'ok', `${scenario.channel} \u00b7 delivered ${scenario.deliveredAt}`, 220),
    );
    deliverEvents.push(
      ev('deliver', 'ok', 'email cc \u00b7 5 recipients (3 seat \u00b7 2 non-seat)', 150),
    );
    deliverEvents.push(
      ev('deliver', 'pending', 'awaiting human approval \u2014 nothing auto-posted', 130),
    );
  } else {
    deliverEvents.push(
      ev('deliver', 'warn', 'channel delivery suppressed by governance gate', 200),
    );
    deliverEvents.push(
      ev('deliver', 'pending', 'analyst notified \u00b7 manual review required', 150),
    );
  }

  const artifact: Artifact = { kind: 'brief' };

  stages.push({
    stage: 'deliver',
    events: deliverEvents,
    durationMs: clock - deliverStart,
    degraded: !passedGate,
    artifact,
  });

  return {
    scenarioId: scenario.id,
    model,
    batch,
    faults,
    stages,
    totalMs: clock,
    usage,
    costUsd,
    retries,
    confidence,
    passedGate,
    gateReason,
    manualHours: scenario.manualHours,
  };
}

/* ------------------------------------------------------------------ */
/* Small helpers for readable log copy                                 */
/* ------------------------------------------------------------------ */

function payloadNote(scenario: Scenario, i: number): string {
  if (i === 0) return `${scenario.metrics.length} metrics returned`;
  if (i === 1) return `${scenario.listening.mentions} mentions \u00b7 sentiment attached`;
  return 'share-of-voice snapshot pulled';
}

function signalNote(scenario: Scenario): string {
  switch (scenario.id) {
    case 'community-health':
      return 'purchase-intent from engagement volume';
    case 'competitor-launch':
      return 'coordinated campaign from organic drift';
    case 'format-decline':
      return 'format effect from audience effect';
    default:
      return 'durable narrative from monthly noise';
  }
}
