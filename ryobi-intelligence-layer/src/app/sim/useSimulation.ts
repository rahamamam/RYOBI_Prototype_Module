import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { STAGE_ORDER, runPipeline } from './engine';
import { scenarioById, scenarios } from './scenarios';
import type { FaultId, ModelId, RunEvent, RunTrace, Verdict } from './types';

/** Real milliseconds a log line takes to appear at 1x. */
const LINE_MS = 260;
/** Extra pause after a stage finishes before advancing. */
const HOLD_MS = 700;

export type Speed = 0.5 | 1 | 2 | 8;

export interface AuditEntry {
  id: number;
  at: string;
  scenario: string;
  verdict: Verdict;
  confidence: number;
  note: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export function useSimulation() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [model, setModel] = useState<ModelId>('haiku-4-5');
  const [batch, setBatch] = useState(false);
  const [faults, setFaults] = useState<FaultId[]>([]);
  const [speed, setSpeed] = useState<Speed>(1);

  const [stageIndex, setStageIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [runCount, setRunCount] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const auditId = useRef(0);

  const scenario = useMemo(() => scenarioById(scenarioId), [scenarioId]);

  // The trace is pure: same inputs, same output. Recomputed only when the
  // configuration changes — never during playback.
  const trace: RunTrace = useMemo(
    () => runPipeline({ scenario, model, batch, faults }),
    [scenario, model, batch, faults],
  );

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const resetPlayback = useCallback(() => {
    clearTimers();
    setStageIndex(-1);
    setRunning(false);
    setVisibleCount(0);
    setVerdict(null);
  }, [clearTimers]);

  // Any configuration change invalidates the current playback.
  useEffect(() => {
    resetPlayback();
  }, [scenarioId, model, batch, faults, resetPlayback]);

  // All log lines up to and including the current stage, revealed progressively.
  const logs: RunEvent[] = useMemo(() => {
    if (stageIndex < 0) return [];
    const completed = trace.stages.slice(0, stageIndex).flatMap((s) => s.events);
    const current = trace.stages[stageIndex]?.events.slice(0, visibleCount) ?? [];
    return [...completed, ...current];
  }, [trace, stageIndex, visibleCount]);

  // Reveal the active stage's lines one at a time.
  useEffect(() => {
    if (stageIndex < 0) return;
    clearTimers();

    const stage = trace.stages[stageIndex];
    if (!stage) return;

    if (prefersReducedMotion() || speed === 8) {
      setVisibleCount(stage.events.length);
      return;
    }

    setVisibleCount(0);
    stage.events.forEach((_, i) => {
      const t = setTimeout(() => setVisibleCount(i + 1), ((i + 1) * LINE_MS) / speed);
      timers.current.push(t);
    });

    return clearTimers;
  }, [stageIndex, trace, speed, clearTimers]);

  // Auto-advance while running.
  useEffect(() => {
    if (!running || stageIndex < 0) return;
    const stage = trace.stages[stageIndex];
    if (!stage) return;

    const reveal =
      prefersReducedMotion() || speed === 8 ? 200 : (stage.events.length * LINE_MS) / speed;
    const total = reveal + HOLD_MS / speed;

    const t = setTimeout(() => {
      setStageIndex((i) => {
        if (i >= STAGE_ORDER.length - 1) {
          setRunning(false);
          return i;
        }
        return i + 1;
      });
    }, total);

    return () => clearTimeout(t);
  }, [running, stageIndex, trace, speed]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const run = useCallback(() => {
    clearTimers();
    setVerdict(null);
    setVisibleCount(0);
    setStageIndex(0);
    setRunning(true);
    setRunCount((c) => c + 1);
  }, [clearTimers]);

  const pause = useCallback(() => setRunning(false), []);

  const step = useCallback(() => {
    setRunning(false);
    clearTimers();
    setStageIndex((i) => {
      const next = Math.min(i + 1, STAGE_ORDER.length - 1);
      setVisibleCount(trace.stages[next]?.events.length ?? 0);
      return next;
    });
  }, [clearTimers, trace]);

  const back = useCallback(() => {
    setRunning(false);
    clearTimers();
    setStageIndex((i) => {
      const next = Math.max(i - 1, 0);
      setVisibleCount(trace.stages[next]?.events.length ?? 0);
      return next;
    });
  }, [clearTimers, trace]);

  const jump = useCallback(
    (i: number) => {
      setRunning(false);
      clearTimers();
      setStageIndex(i);
      setVisibleCount(trace.stages[i]?.events.length ?? 0);
    },
    [clearTimers, trace],
  );

  const reset = useCallback(() => resetPlayback(), [resetPlayback]);

  const toggleFault = useCallback((f: FaultId) => {
    setFaults((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  }, []);

  const decide = useCallback(
    (v: Verdict, note: string) => {
      setVerdict(v);
      setAudit((prev) =>
        [
          {
            id: auditId.current++,
            at: new Date().toLocaleTimeString('en-CA', { hour12: false }),
            scenario: scenario.label,
            verdict: v,
            confidence: trace.confidence,
            note,
          },
          ...prev,
        ].slice(0, 8),
      );
    },
    [scenario.label, trace.confidence],
  );

  const atEnd = stageIndex >= STAGE_ORDER.length - 1;
  const atStart = stageIndex <= 0;
  const started = stageIndex >= 0;

  // Elapsed simulated time up to the last revealed line.
  const elapsedMs = logs.length ? logs[logs.length - 1].t : 0;

  return {
    // configuration
    scenario,
    scenarioId,
    setScenarioId,
    model,
    setModel,
    batch,
    setBatch,
    faults,
    toggleFault,
    setFaults,
    speed,
    setSpeed,
    // derived
    trace,
    logs,
    elapsedMs,
    // playback state
    stageIndex,
    running,
    started,
    atEnd,
    atStart,
    runCount,
    // controls
    run,
    pause,
    step,
    back,
    jump,
    reset,
    // governance
    verdict,
    decide,
    audit,
  };
}

export type SimulationApi = ReturnType<typeof useSimulation>;
