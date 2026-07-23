import { CheckCircle2, PenLine, ShieldCheck, XCircle } from 'lucide-react';
import type { SimulationApi } from '../useSimulation';
import type { Verdict } from '../types';

const OPTIONS: {
  verdict: Verdict;
  label: string;
  note: string;
  icon: typeof CheckCircle2;
  color: string;
}[] = [
  {
    verdict: 'approved',
    label: 'Approve',
    note: 'Actions accepted; a human drafts and publishes in RYOBI\u2019s voice.',
    icon: CheckCircle2,
    color: 'var(--ryobi-green)',
  },
  {
    verdict: 'revision',
    label: 'Request revision',
    note: 'Synthesis returned with analyst notes; re-run against corrected framing.',
    icon: PenLine,
    color: 'var(--status-warn)',
  },
  {
    verdict: 'rejected',
    label: 'Reject',
    note: 'Recommendation discarded and logged; nothing propagates downstream.',
    icon: XCircle,
    color: 'var(--status-error)',
  },
];

/**
 * The governance claim in the report is that AI never publishes. This makes it
 * literal: the run does not conclude until a person clicks something.
 */
export function ApprovalGate({ sim }: { sim: SimulationApi }) {
  const { verdict, audit, trace } = sim;
  const chosen = OPTIONS.find((o) => o.verdict === verdict);

  return (
    <div
      className="rounded-md border"
      style={{
        borderColor: verdict ? 'var(--border)' : 'var(--ryobi-green)',
        background: 'var(--surface-raised)',
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600 }}>
          <ShieldCheck size={14} style={{ color: 'var(--ryobi-green)' }} />
          Human-in-the-loop · decision layer
        </span>
        <span
          className="tabular"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            color: 'var(--muted-foreground)',
          }}
        >
          confidence {trace.confidence.toFixed(2)}
        </span>
      </div>

      <div className="p-4">
        {!verdict ? (
          <>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted-foreground)' }}>
              {trace.passedGate
                ? 'The brief has been delivered as a recommendation. The run does not complete until a named human decides — this is the step that is deliberately not automated.'
                : 'The gate withheld delivery. An analyst still owns the outcome: accept the synthesis after checking it, send it back, or discard it.'}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {OPTIONS.map((o) => {
                const Icon = o.icon;
                return (
                  <button
                    key={o.verdict}
                    onClick={() => sim.decide(o.verdict, o.note)}
                    className="rounded-md border p-3 text-left transition-colors"
                    style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                  >
                    <span
                      className="flex items-center gap-1.5"
                      style={{ fontSize: 13, fontWeight: 600, color: o.color }}
                    >
                      <Icon size={14} /> {o.label}
                    </span>
                    <span
                      className="mt-1.5 block"
                      style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted-foreground)' }}
                    >
                      {o.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="reveal">
            <div
              className="flex items-center gap-2"
              style={{ fontSize: 14, fontWeight: 600, color: chosen?.color }}
            >
              {chosen && <chosen.icon size={16} />} {chosen?.label} — recorded
            </div>
            <p
              className="mt-1.5"
              style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--muted-foreground)' }}
            >
              {chosen?.note} The decision is written to the audit trail with the model, confidence,
              and timestamp attached, so every published action is traceable to a person.
            </p>
            <button
              onClick={sim.run}
              className="mt-3 rounded-md border px-3 py-2 transition-colors"
              style={{ borderColor: 'var(--border)', fontSize: 12.5 }}
            >
              Run the next cycle
            </button>
          </div>
        )}

        {audit.length > 0 && (
          <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
            <div
              className="uppercase"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.09em',
                color: 'var(--muted-foreground)',
              }}
            >
              Audit trail
            </div>
            <ul className="mt-2 space-y-1">
              {audit.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-x-2 gap-y-0.5"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}
                >
                  <span className="tabular" style={{ color: 'var(--muted-foreground)' }}>
                    {a.at}
                  </span>
                  <span
                    style={{
                      color:
                        a.verdict === 'approved'
                          ? 'var(--ryobi-green)'
                          : a.verdict === 'revision'
                            ? 'var(--status-warn)'
                            : 'var(--status-error)',
                    }}
                  >
                    {a.verdict.toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    {a.scenario} · conf {a.confidence.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
