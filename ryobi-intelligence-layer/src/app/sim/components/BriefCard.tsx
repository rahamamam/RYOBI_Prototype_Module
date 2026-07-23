import { Clock, Hash, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { RunTrace, Scenario } from '../types';
import { CONFIDENCE_THRESHOLD } from '../engine';

/**
 * The deliverable as RYOBI's marketing team actually sees it — and, when the
 * governance gate holds, what they see instead. The held state is the more
 * important of the two: it is the control working.
 */
export function BriefCard({ scenario, trace }: { scenario: Scenario; trace: RunTrace }) {
  if (!trace.passedGate) return <HeldCard scenario={scenario} trace={trace} />;

  const rows = [
    { k: 'What moved', v: scenario.finding.whatMoved },
    { k: 'Why it moved', v: scenario.finding.whyItMoved },
    { k: 'What it means', v: scenario.finding.whatItMeans },
  ];

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}
      >
        <span className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 600 }}>
          <Hash size={14} style={{ color: 'var(--muted-foreground)' }} />
          {scenario.channel.replace('#', '')}
        </span>
        <span
          className="flex items-center gap-1"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted-foreground)' }}
        >
          <Clock size={11} /> {scenario.deliveredAt}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="flex gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={{
              background: 'var(--ryobi-green)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            IL
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <span style={{ fontWeight: 600, fontSize: 14 }}>Intelligence Layer</span>
              <span
                className="rounded px-1.5 py-0.5"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                }}
              >
                APP
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
                {scenario.deliveredAt}
              </span>
            </div>

            <div
              className="mt-2 rounded-md border-l-4 p-4"
              style={{ borderColor: 'var(--ryobi-green)', background: 'var(--accent)' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, lineHeight: 1.25 }}>
                {scenario.cadence === 'monthly'
                  ? 'Monthly Strategic Brief'
                  : scenario.cadence === 'weekly'
                    ? 'Weekly Brief'
                    : 'Daily Brief'}{' '}
                — {scenario.pillar}
              </div>

              {/* The contrast that makes the point. */}
              <div
                className="mt-3 rounded-sm border px-3 py-2"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              >
                <div
                  className="uppercase"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.08em',
                    color: 'var(--muted-foreground)',
                  }}
                >
                  A dashboard alone would say
                </div>
                <div
                  className="mt-1"
                  style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic' }}
                >
                  {scenario.dashboardReading}
                </div>
              </div>

              <dl className="mt-3 space-y-2.5">
                {rows.map((r) => (
                  <div key={r.k}>
                    <dt style={{ fontSize: 12.5, fontWeight: 600 }}>{r.k}</dt>
                    <dd style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--muted-foreground)' }}>
                      {r.v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Recommended actions</div>
                <ol className="mt-1.5 space-y-1">
                  {scenario.finding.actions.map((a, i) => (
                    <li key={i} className="flex gap-2" style={{ fontSize: 13.5, lineHeight: 1.45 }}>
                      <span
                        className="shrink-0 tabular"
                        style={{ color: 'var(--ryobi-green)', fontFamily: 'var(--font-mono)' }}
                      >
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ol>
              </div>

              <div
                className="mt-3 flex items-center gap-1.5"
                style={{ fontSize: 11.5, color: 'var(--accent-foreground)' }}
              >
                <ShieldCheck size={13} className="shrink-0" />
                Recommendation only · confidence {trace.confidence.toFixed(2)} · requires human review
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {['\ud83d\udc40 3', '\u2705 2', '\ud83d\udd25 1'].map((r) => (
                <span
                  key={r}
                  className="rounded-full border px-2 py-0.5"
                  style={{ borderColor: 'var(--border)', fontSize: 12 }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="border-t px-4 py-2"
        style={{
          borderColor: 'var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          color: 'var(--muted-foreground)',
        }}
      >
        cc email → 5 recipients (3 seat · 2 non-seat) · auto_post = false
      </div>
    </div>
  );
}

function HeldCard({ scenario, trace }: { scenario: Scenario; trace: RunTrace }) {
  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border"
      style={{ borderColor: 'var(--status-warn)', background: 'var(--card)' }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-2.5"
        style={{
          borderColor: 'var(--border)',
          background: 'color-mix(in srgb, var(--status-warn) 12%, transparent)',
        }}
      >
        <span
          className="flex items-center gap-1.5"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--status-warn)' }}
        >
          <LockKeyhole size={14} /> Delivery held by governance gate
        </span>
        <span
          className="tabular"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted-foreground)' }}
        >
          {trace.confidence.toFixed(2)} &lt; {CONFIDENCE_THRESHOLD.toFixed(2)}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>
          Nothing was posted to {scenario.channel}.
        </h3>
        <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
          {trace.gateReason} The synthesis was not discarded — it was routed to the review queue with
          its reasoning attached, so an analyst can accept, correct, or reject it.
        </p>

        <div
          className="mt-4 rounded-md border-l-[3px] py-3 pl-4 pr-4"
          style={{
            borderColor: 'var(--status-warn)',
            background: 'color-mix(in srgb, var(--status-warn) 8%, transparent)',
            fontSize: 13.5,
            lineHeight: 1.55,
          }}
        >
          This is the mitigation for Risk 1 behaving as designed. The pipeline is built to be late
          rather than wrong: a held brief costs the team a morning, an unreviewed wrong brief costs
          them a decision.
        </div>

        <div className="mt-5">
          <div
            className="uppercase"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.09em',
              color: 'var(--muted-foreground)',
            }}
          >
            Withheld synthesis · for analyst review only
          </div>
          <dl className="mt-2 space-y-2">
            {[
              { k: 'Claimed movement', v: scenario.finding.whatMoved },
              { k: 'Claimed cause', v: scenario.finding.whyItMoved },
            ].map((r) => (
              <div key={r.k}>
                <dt style={{ fontSize: 12.5, fontWeight: 600 }}>{r.k}</dt>
                <dd
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--muted-foreground)',
                    opacity: 0.75,
                  }}
                >
                  {r.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div
        className="border-t px-4 py-2"
        style={{
          borderColor: 'var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          color: 'var(--muted-foreground)',
        }}
      >
        channel_posted = null · routed_to = human review queue
      </div>
    </div>
  );
}
