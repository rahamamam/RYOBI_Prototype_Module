import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { FAULTS } from '../engine';
import type { SimulationApi } from '../useSimulation';

/**
 * Fault injection is what separates a simulation from an animation. Each
 * toggle maps to a named entry in the report's risk register, and the run
 * re-derives to show how the design absorbs it.
 */
export function FaultPanel({ sim }: { sim: SimulationApi }) {
  const active = sim.faults.length;

  return (
    <div
      className="rounded-md border"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-raised)' }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600 }}>
          <Zap size={14} style={{ color: 'var(--status-warn)' }} />
          Fault injection
        </span>
        <div className="flex items-center gap-2">
          <span
            className="tabular"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              color: active ? 'var(--status-warn)' : 'var(--muted-foreground)',
            }}
          >
            {active} active
          </span>
          {active > 0 && (
            <button
              onClick={() => sim.setFaults([])}
              className="rounded px-2 py-0.5 transition-colors"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                color: 'var(--muted-foreground)',
                border: '1px solid var(--border)',
              }}
            >
              clear
            </button>
          )}
        </div>
      </div>

      <p
        className="px-4 pt-3"
        style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--muted-foreground)' }}
      >
        Each fault maps to a named risk. Toggle one and re-run: the pipeline re-derives, and the
        log shows how the design absorbs it.
      </p>

      <div className="grid gap-2 p-4 sm:grid-cols-2">
        {FAULTS.map((f) => {
          const on = sim.faults.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => sim.toggleFault(f.id)}
              aria-pressed={on}
              className="rounded-md border p-3 text-left transition-colors"
              style={{
                borderColor: on ? 'var(--status-warn)' : 'var(--border)',
                background: on
                  ? 'color-mix(in srgb, var(--status-warn) 9%, transparent)'
                  : 'var(--card)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{f.label}</span>
                <span
                  className="mt-0.5 shrink-0 rounded-full px-1.5 py-0.5"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8.5,
                    letterSpacing: '0.06em',
                    background: on ? 'var(--status-warn)' : 'var(--muted)',
                    color: on ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {f.stage.toUpperCase()}
                </span>
              </div>

              <div
                className="mt-2 flex gap-1.5"
                style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted-foreground)' }}
              >
                <AlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--status-warn)' }} />
                <span>{f.risk}</span>
              </div>
              <div
                className="mt-1.5 flex gap-1.5"
                style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted-foreground)' }}
              >
                <ShieldCheck size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--ryobi-green)' }} />
                <span>{f.mitigation}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
