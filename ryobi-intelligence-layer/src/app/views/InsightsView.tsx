import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  Facebook,
  Globe,
  Instagram,
  Lightbulb,
  Music2,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Eyebrow, Lede, PageTitle, Stat } from '../components/Primitives';
import { categories, insights } from '../data/insights';
import type { Insight, Platform, Severity } from '../data/insights';

const platformIcon: Record<Platform, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  cross: Globe,
};

const sevMeta: Record<
  Severity,
  { label: string; color: string; icon: LucideIcon }
> = {
  opportunity: { label: 'Opportunity', color: 'var(--ryobi-green)', icon: Lightbulb },
  watch: { label: 'Watch', color: 'var(--status-info)', icon: Eye },
  alert: { label: 'Alert', color: 'var(--status-error)', icon: AlertTriangle },
};

const statusMeta = {
  new: { label: 'New', bg: 'var(--ryobi-green)', fg: '#fff', border: 'none' },
  reviewing: { label: 'In review', bg: 'var(--muted)', fg: 'var(--foreground)', border: 'none' },
  actioned: {
    label: 'Actioned',
    bg: 'transparent',
    fg: 'var(--muted-foreground)',
    border: '1px solid var(--border)',
  },
} as const;

function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const sev = sevMeta[insight.severity];
  const SevIcon = sev.icon;
  const st = statusMeta[insight.status];

  return (
    <div
      className="flex flex-col rounded-md border transition-colors"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: `color-mix(in srgb, ${sev.color} 13%, transparent)`,
              color: sev.color,
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
            }}
          >
            <SevIcon size={11} /> {sev.label}
          </span>
          <span
            className="shrink-0 rounded-full px-2.5 py-1"
            style={{
              background: st.bg,
              color: st.fg,
              border: st.border,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            {st.label}
          </span>
        </div>

        <h3 className="mt-3" style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.22 }}>
          {insight.title}
        </h3>
        <p
          className="mt-2"
          style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--muted-foreground)' }}
        >
          {insight.summary}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-1" aria-label="Platforms">
            {insight.platforms.map((p) => {
              const Icon = platformIcon[p];
              return <Icon key={p} size={14} />;
            })}
          </span>
          <span
            className="rounded-sm px-2 py-0.5"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontSize: 11,
            }}
          >
            {insight.pillar}
          </span>
          <span
            className="ml-auto flex items-center gap-1"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10.5,
              color: 'var(--muted-foreground)',
            }}
          >
            <Sparkles size={10} style={{ color: 'var(--ryobi-green)' }} /> {insight.model}
          </span>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-auto flex items-center justify-between border-t px-5 py-2.5 text-left transition-colors"
        style={{ borderColor: 'var(--border)' }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          {open ? 'Hide' : 'Why & recommended actions'}
        </span>
        <ChevronDown
          size={15}
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      {open && (
        <div className="reveal border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <Label>Why it moved</Label>
          <p className="mt-1.5" style={{ fontSize: 13, lineHeight: 1.55 }}>
            {insight.why}
          </p>

          <div className="mt-4">
            <Label>Recommended actions · for human review</Label>
          </div>
          <ul className="mt-2 space-y-1.5">
            {insight.actions.map((a, i) => (
              <li key={i} className="flex gap-2" style={{ fontSize: 13, lineHeight: 1.45 }}>
                <span
                  className="shrink-0 tabular"
                  style={{ color: 'var(--ryobi-green)', fontFamily: 'var(--font-mono)' }}
                >
                  {i + 1}
                </span>
                {a}
              </li>
            ))}
          </ul>

          <div
            className="mt-3 flex items-center gap-1.5"
            style={{ fontSize: 11, color: 'var(--muted-foreground)' }}
          >
            <ShieldCheck size={12} className="shrink-0" style={{ color: 'var(--ryobi-green)' }} />
            Confidence {insight.confidence.toFixed(2)} · delivered {insight.delivered} · never
            auto-posted
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase"
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.09em',
        color: 'var(--muted-foreground)',
      }}
    >
      {children}
    </div>
  );
}

export function InsightsView() {
  const [active, setActive] = useState('all');
  const [sevFilter, setSevFilter] = useState<Severity | 'all'>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: insights.length };
    for (const c of categories) m[c.id] = insights.filter((i) => i.category === c.id).length;
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return insights.filter((i) => {
      if (active !== 'all' && i.category !== active) return false;
      if (sevFilter !== 'all' && i.severity !== sevFilter) return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        i.why.toLowerCase().includes(q) ||
        i.pillar.toLowerCase().includes(q) ||
        i.actions.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [active, sevFilter, query]);

  const activeCat = categories.find((c) => c.id === active);

  const sevCounts = useMemo(() => {
    const base: Record<Severity, number> = { opportunity: 0, watch: 0, alert: 0 };
    for (const i of filtered) base[i.severity]++;
    return base;
  }, [filtered]);

  return (
    <>
      <Eyebrow>Layer 3 · reasoning output</Eyebrow>
      <PageTitle>
        The insight <span style={{ color: 'var(--ryobi-green)' }}>library</span>.
      </PageTitle>
      <Lede>
        Everything the reasoning layer synthesised from this cycle's Sprout signal, categorised. Each
        card explains what moved, why, and what to consider — a recommendation addressed to a named
        human, never an action taken automatically.
      </Lede>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="In view" value={filtered.length} />
        <Stat label="Opportunities" value={sevCounts.opportunity} color="var(--ryobi-green)" />
        <Stat label="To watch" value={sevCounts.watch} color="var(--status-info)" />
        <Stat label="Alerts" value={sevCounts.alert} color="var(--status-error)" />
      </div>

      {/* Search */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div
          className="flex min-w-[240px] flex-1 items-center gap-2 rounded-md border px-3 py-2"
          style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
        >
          <Search size={15} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search insights, pillars, actions…"
            aria-label="Search insights"
            className="w-full bg-transparent outline-none"
            style={{ fontSize: 13.5, color: 'var(--foreground)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-foreground)' }}
            >
              clear
            </button>
          )}
        </div>

        <div
          className="flex overflow-hidden rounded-md border"
          style={{ borderColor: 'var(--border)' }}
          role="group"
          aria-label="Filter by severity"
        >
          {(['all', 'opportunity', 'watch', 'alert'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSevFilter(s)}
              aria-pressed={sevFilter === s}
              className="px-3 py-2 transition-colors"
              style={{
                background:
                  sevFilter === s
                    ? s === 'all'
                      ? 'var(--foreground)'
                      : sevMeta[s].color
                    : 'transparent',
                color: sevFilter === s ? 'var(--background)' : 'var(--muted-foreground)',
                fontSize: 12.5,
              }}
            >
              {s === 'all' ? 'All' : sevMeta[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip label="All" count={counts.all} active={active === 'all'} onClick={() => setActive('all')} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            count={counts[c.id]}
            active={active === c.id}
            onClick={() => setActive(c.id)}
          />
        ))}
      </div>

      {activeCat && (
        <p className="mt-3" style={{ fontSize: 13.5, color: 'var(--muted-foreground)' }}>
          {activeCat.blurb}
        </p>
      )}

      {filtered.length === 0 ? (
        <div
          className="mt-8 rounded-md border border-dashed p-10 text-center"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', fontSize: 14 }}
        >
          No insights match that filter.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}
    </>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors"
      style={{
        borderColor: active ? 'var(--ryobi-green)' : 'var(--border)',
        background: active ? 'var(--ryobi-green)' : 'transparent',
        color: active ? '#fff' : 'var(--foreground)',
        fontSize: 13,
      }}
    >
      {label}
      <span className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, opacity: 0.72 }}>
        {count}
      </span>
    </button>
  );
}
