import { Boxes, Database, Sparkles, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Callout, Eyebrow, Lede, PageTitle, Panel } from '../components/Primitives';

interface Layer {
  n: number;
  id: string;
  name: string;
  actor: string;
  icon: LucideIcon;
  does: string;
  closes: string;
  detail: string[];
}

const LAYERS: Layer[] = [
  {
    n: 1,
    id: 'data',
    name: 'Data & listening',
    actor: 'Sprout Social Advanced + Listening add-on',
    icon: Database,
    does: 'Centralises publishing, engagement, analytics, competitor tracking, and web-wide listening across Instagram, Facebook, and TikTok into one environment.',
    closes: 'Closes the data-fragmentation half of the root cause.',
    detail: [
      'Analytics API access is Advanced-tier only — it is the single feature that forces this tier',
      'Smart Inbox sentiment covers owned accounts; Listening covers the open social web',
      'Share of voice is the substantive competitive measure, not follower counts',
    ],
  },
  {
    n: 2,
    id: 'orchestrator',
    name: 'Connective orchestration',
    actor: 'Make.com · n8n · scheduled script',
    icon: Boxes,
    does: 'Authenticates to the Analytics API on a schedule or trigger, packages the response, calls the reasoning endpoint, and routes the output to where the team already works.',
    closes: 'Structural, not convenient — it is what keeps data moving without manual exports.',
    detail: [
      'The Claude API is a reasoning endpoint, not an integration layer',
      'It cannot pull from Sprout, run on a schedule, or deliver on its own',
      'Remove this layer and a human becomes the integration layer again — the original defect',
    ],
  },
  {
    n: 3,
    id: 'reasoning',
    name: 'Reasoning & decision support',
    actor: 'Claude — Haiku 4.5 and Sonnet',
    icon: Sparkles,
    does: 'Interprets what Sprout surfaces: synthesises competitive insight, flags content gaps, explains what changed and why, and drafts recommendations and on-brand content options for review.',
    closes: 'Closes the insight-fragmentation half of the root cause.',
    detail: [
      'Haiku 4.5 handles the automated daily and weekly digests',
      'Sonnet handles the monthly strategic report where cross-period depth pays',
      'The five Claude Team seats run the full-strength model for interactive drafting',
    ],
  },
  {
    n: 4,
    id: 'decision',
    name: 'Human decision layer',
    actor: "RYOBI's marketing team",
    icon: UserCheck,
    does: 'Decides, creates, approves, and publishes. Results flow back into Sprout for measurement and the loop repeats.',
    closes: 'No content reaches an audience without a named human approving it.',
    detail: [
      'Approval workflows configured so publishing is human-only',
      'Auto-posting is never enabled — the config flag is not a preference',
      'Every AI output is a recommendation to a reviewer, never an action taken',
    ],
  },
];

export function ArchitectureView({ onOpenPipeline }: { onOpenPipeline: () => void }) {
  return (
    <>
      <Eyebrow>Composition, not procurement</Eyebrow>
      <PageTitle>
        Four layers, each doing <span style={{ color: 'var(--ryobi-green)' }}>one job well</span>.
      </PageTitle>
      <Lede>
        Neither licensed tool is the deliverable on its own. Sprout produces dashboards that still
        require interpretation; Claude has no social data without Sprout. The value is created by
        closing the loop between them — and by the connective layer most proposals leave implicit.
      </Lede>

      <div className="mt-10 flex flex-col gap-3">
        {LAYERS.map((l, i) => {
          const Icon = l.icon;
          const isOrch = l.id === 'orchestrator';
          return (
            <div key={l.id}>
              <Panel
                style={{
                  borderColor: isOrch ? 'var(--ryobi-green)' : 'var(--border)',
                  borderWidth: isOrch ? 1.5 : 1,
                }}
              >
                <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_1fr]">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: isOrch ? 'var(--ryobi-green)' : 'var(--muted)',
                        color: isOrch ? '#fff' : 'var(--foreground)',
                      }}
                    >
                      <Icon size={19} />
                    </span>
                    <div className="md:w-40">
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          letterSpacing: '0.09em',
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        LAYER {l.n}
                      </div>
                      <div
                        className="mt-0.5"
                        style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {l.name}
                      </div>
                      <div
                        className="mt-1"
                        style={{ fontSize: 11.5, lineHeight: 1.4, color: 'var(--muted-foreground)' }}
                      >
                        {l.actor}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize: 14, lineHeight: 1.6 }}>{l.does}</p>
                    <p
                      className="mt-2"
                      style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ryobi-green)', fontWeight: 500 }}
                    >
                      {l.closes}
                    </p>
                  </div>

                  <ul className="space-y-1.5">
                    {l.detail.map((d) => (
                      <li
                        key={d}
                        className="flex gap-2"
                        style={{ fontSize: 12.5, lineHeight: 1.5, color: 'var(--muted-foreground)' }}
                      >
                        <span style={{ color: 'var(--ryobi-green)' }}>—</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>

              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-1.5" aria-hidden>
                  <svg width="10" height="22" viewBox="0 0 10 22">
                    <line
                      x1="5"
                      y1="0"
                      x2="5"
                      y2="16"
                      stroke="var(--ryobi-green)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <path d="M5 22 L1 15 L9 15 Z" fill="var(--ryobi-green)" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Callout>
          <strong>Why the orchestrator is not optional.</strong> A proposal that names only Sprout
          and Claude has described two products, not a system. The layer between them is the part
          that eliminates manual exports — and it is the part that would otherwise quietly remain a
          person.
        </Callout>
        <Callout>
          <strong>Hub and spoke.</strong> Three Sprout Advanced seats cap the concurrent operators;
          five Claude Team seats give the whole department synthesised intelligence and drafting.
          Non-seat users receive shared report links and scheduled PDFs — no login, no fourth seat.
        </Callout>
      </div>

      <button
        onClick={onOpenPipeline}
        className="mt-8 rounded-md px-4 py-2.5 transition-opacity hover:opacity-90"
        style={{ background: 'var(--ryobi-green)', color: '#fff', fontSize: 14, fontWeight: 600 }}
      >
        Run the pipeline →
      </button>
    </>
  );
}
