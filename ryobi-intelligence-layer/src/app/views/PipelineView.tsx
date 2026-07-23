import { useEffect } from 'react';
import { ArrowRight, Keyboard } from 'lucide-react';
import { Eyebrow, Lede, PageTitle } from '../components/Primitives';
import { ApprovalGate } from '../sim/components/ApprovalGate';
import { BriefCard } from '../sim/components/BriefCard';
import { CodePanel } from '../sim/components/CodePanel';
import { ControlBar } from '../sim/components/ControlBar';
import { FaultPanel } from '../sim/components/FaultPanel';
import { LogConsole } from '../sim/components/LogConsole';
import { RunMetrics } from '../sim/components/RunMetrics';
import { ScenarioPicker } from '../sim/components/ScenarioPicker';
import { StageRail } from '../sim/components/StageRail';
import { STAGES } from '../sim/engine';
import type { SimulationApi } from '../sim/useSimulation';

const CHAIN = ['Sprout Social', 'Orchestrator', 'Claude', 'Orchestrator', 'Marketing team'];

export function PipelineView({ sim }: { sim: SimulationApi }) {
  const { stageIndex, trace, scenario, started } = sim;
  const stage = stageIndex >= 0 ? trace.stages[stageIndex] : null;
  const meta = stageIndex >= 0 ? STAGES[stageIndex] : null;

  // Keyboard transport. Ignored while the user is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === 'Space') {
        e.preventDefault();
        sim.running ? sim.pause() : sim.run();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        sim.step();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        sim.back();
      } else if (e.key === 'r' || e.key === 'R') {
        sim.reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sim]);

  return (
    <>
      <Eyebrow>Signal in · decision out</Eyebrow>
      <PageTitle>
        The orchestrator, <span style={{ color: 'var(--ryobi-green)' }}>step by step</span>.
      </PageTitle>
      <Lede>
        The Claude API can reason but not integrate — it cannot pull from Sprout, run on a schedule,
        or deliver on its own. Watch the connective layer do exactly that: package Sprout Social's
        raw outputs for Claude, then repackage Claude's reasoning into a brief RYOBI's marketing team
        actually reads. Every payload below is derived from the selected scenario, not scripted.
      </Lede>

      <div
        className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted-foreground)' }}
      >
        {CHAIN.map((n, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              style={{
                color: i === 1 || i === 3 ? 'var(--ryobi-green)' : 'var(--foreground)',
                fontWeight: i === 1 || i === 3 ? 600 : 400,
              }}
            >
              {n}
            </span>
            {i < CHAIN.length - 1 && <ArrowRight size={12} />}
          </span>
        ))}
      </div>

      <div className="mt-9 flex flex-col gap-5">
        <ScenarioPicker sim={sim} />
        <ControlBar sim={sim} />
        <StageRail activeIndex={stageIndex} trace={trace} onJump={sim.jump} />

        {/* Stage narration */}
        <div
          className="rounded-md border p-4"
          style={{
            borderColor: 'var(--border)',
            background: stage ? 'var(--accent)' : 'transparent',
          }}
        >
          {stage && meta ? (
            <div key={stageIndex} className="reveal">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
                  {headingFor(stageIndex)}
                </span>
                <span
                  className="tabular"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--muted-foreground)',
                  }}
                >
                  {meta.actor} · {(stage.durationMs / 1000).toFixed(2)}s
                </span>
              </div>
              <p className="mt-1.5" style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
                {captionFor(stageIndex, sim)}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
              Press <strong style={{ color: 'var(--foreground)' }}>Run pipeline</strong> to watch the
              orchestrator pull Sprout Social data, package it for Claude, then repackage Claude's
              reasoning into a brief for RYOBI's marketing team. Inject a fault below to see how the
              design behaves when a vendor does not cooperate.
            </p>
          )}
        </div>

        {/* Artifact + log */}
        <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]" style={{ minHeight: 470 }}>
          <div key={`${stageIndex}-${sim.runCount}`} className="reveal min-h-[470px]">
            {!stage ? (
              <Placeholder />
            ) : stage.artifact.kind === 'brief' ? (
              <BriefCard scenario={scenario} trace={trace} />
            ) : (
              <CodePanel
                title={stage.artifact.title}
                badge={stage.artifact.badge}
                code={stage.artifact.code}
              />
            )}
          </div>
          <div className="min-h-[470px]">
            <LogConsole logs={sim.logs} running={sim.running} elapsedMs={sim.elapsedMs} />
          </div>
        </div>

        <RunMetrics trace={trace} started={started} />

        {stageIndex === STAGES.length - 1 && <ApprovalGate sim={sim} />}

        <FaultPanel sim={sim} />

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-foreground)' }}
        >
          <span className="flex items-center gap-1.5">
            <Keyboard size={12} /> shortcuts
          </span>
          <span>space run / pause</span>
          <span>← → step</span>
          <span>r reset</span>
        </div>
      </div>
    </>
  );
}

function Placeholder() {
  return (
    <div
      className="flex h-full min-h-[470px] flex-col items-center justify-center rounded-md border border-dashed"
      style={{ borderColor: 'var(--border)' }}
    >
      <div
        style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted-foreground)' }}
      >
        payload viewer
      </div>
      <div className="mt-1" style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
        the artifact at each stage renders here
      </div>
    </div>
  );
}

function headingFor(i: number): string {
  return [
    'Pull from Sprout Social',
    'Package the request for Claude',
    'Claude reasons over the signal',
    'Package the brief for the team',
    "RYOBI's marketing team receives the brief",
  ][i];
}

function captionFor(i: number, sim: SimulationApi): string {
  const { scenario, trace } = sim;

  switch (i) {
    case 0:
      return `The orchestrator authenticates to the Analytics API — Advanced-tier only — and requests ${scenario.endpoints.length} endpoints covering the ${scenario.pillar} pillar, the listening topics, and the competitor watchlist.`;
    case 1:
      return `Raw payloads are normalised and merged, the KPI-pillar and brand-voice system prompt is attached, and a single request is assembled. This stage is the reason the orchestrator exists: the reasoning endpoint cannot do any of it.`;
    case 2:
      return trace.passedGate
        ? `Claude interprets what Sprout surfaced rather than restating it — separating signal from volume, flagging the gap, and drafting actions. It returns structured JSON with a calibrated confidence and an explicit human-review flag.`
        : `Claude returned a synthesis it is not confident in. Reporting low confidence honestly is the behaviour you want; what happens next is the control.`;
    case 3:
      return trace.passedGate
        ? `The orchestrator parses the response, checks it against the confidence threshold, and formats it into a Slack Block Kit message plus email — reaching non-seat users with no login required.`
        : `The governance gate compared the reported confidence against the delivery threshold and withheld the brief. Nothing reached the channel.`;
    default:
      return trace.passedGate
        ? `The brief lands before the workday starts. Every recommendation is a prompt for a named human — the team responds in the Sprout inbox and drafts in RYOBI's voice. AI never publishes.`
        : `No brief was delivered. An analyst picks it up from the review queue instead — late, but never wrong by default.`;
  }
}
