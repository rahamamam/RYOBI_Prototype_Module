import { AlertTriangle, Boxes, Check, Database, Send, Sparkles, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { STAGES } from '../engine';
import type { RunTrace, StageId } from '../types';

const icons: Record<StageId, LucideIcon> = {
  pull: Database,
  package: Boxes,
  reason: Sparkles,
  format: Send,
  deliver: Users,
};

export function StageRail({
  activeIndex,
  trace,
  onJump,
}: {
  activeIndex: number;
  trace: RunTrace;
  onJump: (i: number) => void;
}) {
  return (
    <div className="hide-scrollbar -mx-1 flex items-stretch gap-1 overflow-x-auto px-1 pb-1">
      {STAGES.map((s, i) => {
        const Icon = icons[s.id];
        const active = i === activeIndex;
        const done = i < activeIndex;
        const isOrch = s.layer === 'orchestrator';
        const degraded = trace.stages[i]?.degraded && (active || done);

        const accent = degraded ? 'var(--status-warn)' : 'var(--ryobi-green)';

        return (
          <div key={s.id} className="flex flex-1 items-center gap-1" style={{ minWidth: 138 }}>
            <button
              onClick={() => onJump(i)}
              aria-current={active ? 'step' : undefined}
              aria-label={`Stage ${i + 1}: ${s.label} — ${s.actor}`}
              className="group relative flex w-full flex-col gap-2 rounded-md border p-3 text-left transition-all"
              style={{
                borderColor: active
                  ? accent
                  : done
                    ? 'color-mix(in srgb, var(--ryobi-green) 38%, transparent)'
                    : 'var(--border)',
                background: active ? 'var(--accent)' : 'transparent',
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm transition-colors"
                  style={{
                    background: active || done ? accent : 'var(--muted)',
                    color: active || done ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {degraded ? (
                    <AlertTriangle size={15} />
                  ) : done ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </span>
                {isOrch && (
                  <span
                    className="rounded-full px-2 py-0.5"
                    style={{
                      background: 'var(--ryobi-black)',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8.5,
                      letterSpacing: '0.07em',
                    }}
                  >
                    ORCH
                  </span>
                )}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    letterSpacing: '0.08em',
                    color: active ? accent : 'var(--muted-foreground)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')} · {s.short}
                </div>
                <div className="mt-0.5" style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.18 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{s.actor}</div>
              </div>

              {active && (
                <span
                  className="absolute inset-x-3 bottom-1 h-0.5 rounded-full"
                  style={{ background: accent }}
                />
              )}
            </button>

            {i < STAGES.length - 1 && (
              <svg width="16" height="10" viewBox="0 0 16 10" className="shrink-0" aria-hidden>
                <line
                  x1="0"
                  y1="5"
                  x2="16"
                  y2="5"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className={i === activeIndex ? 'dashflow' : undefined}
                  stroke={i < activeIndex || i === activeIndex ? 'var(--ryobi-green)' : 'var(--border)'}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
