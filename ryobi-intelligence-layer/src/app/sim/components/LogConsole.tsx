import { useEffect, useRef } from 'react';
import { STAGES } from '../engine';
import type { LogKind, RunEvent, StageId } from '../types';

const shortOf: Record<StageId, string> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.short }),
  {} as Record<StageId, string>,
);

const glyph: Record<LogKind, string> = {
  info: '\u00b7',
  ok: '\u2713',
  warn: '!',
  error: '\u00d7',
  pending: '\u25cb',
};

const tone: Record<LogKind, string> = {
  info: 'var(--console-fg)',
  ok: 'var(--ryobi-green-bright)',
  warn: '#e0a94a',
  error: '#ef5f7c',
  pending: 'rgba(199,202,191,0.6)',
};

const stamp = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
};

export function LogConsole({
  logs,
  running,
  elapsedMs,
}: {
  logs: RunEvent[];
  running: boolean;
  elapsedMs: number;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [logs.length]);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border"
      style={{ borderColor: 'var(--console-border)', background: 'var(--console-bg)' }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-2.5"
        style={{ borderColor: 'var(--console-border)' }}
      >
        <span
          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff' }}
        >
          orchestrator.log
        </span>
        <span
          className="flex items-center gap-1.5"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <span
            className={running ? 'pulsedot' : ''}
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: running ? 'var(--ryobi-green)' : 'rgba(255,255,255,0.3)',
              display: 'inline-block',
            }}
          />
          {running ? 'running' : logs.length ? 'halted' : 'idle'}
          <span className="tabular ml-1">t+{stamp(elapsedMs)}s</span>
        </span>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto p-4"
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, lineHeight: 1.75 }}
        role="log"
        aria-live="polite"
        aria-label="Orchestrator log output"
      >
        {logs.length === 0 ? (
          <span style={{ color: 'rgba(199,202,191,0.5)' }}>{'$ awaiting run\u2026'}</span>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="logline flex gap-2.5">
              <span
                className="tabular shrink-0 select-none"
                style={{ color: 'rgba(255,255,255,0.28)' }}
              >
                {stamp(l.t)}
              </span>
              <span
                className="shrink-0 select-none"
                style={{ color: 'rgba(255,255,255,0.35)', width: 62 }}
              >
                [{shortOf[l.stage]}]
              </span>
              <span className="shrink-0" style={{ color: tone[l.kind], width: 10 }}>
                {glyph[l.kind]}
              </span>
              <span className="min-w-0" style={{ color: tone[l.kind] }}>
                {l.text}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
