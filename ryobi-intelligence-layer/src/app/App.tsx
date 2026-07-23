import { useCallback, useEffect, useState } from 'react';
import { Github, Moon, Sun, Zap } from 'lucide-react';
import { ArchitectureView } from './views/ArchitectureView';
import { PipelineView } from './views/PipelineView';
import { InsightsView } from './views/InsightsView';
import { EconomicsView } from './views/EconomicsView';
import { useSimulation } from './sim/useSimulation';

const TABS = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'insights', label: 'Insights' },
  { id: 'economics', label: 'Economics' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const isTab = (v: string): v is TabId => TABS.some((t) => t.id === v);

const readHash = (): TabId => {
  if (typeof window === 'undefined') return 'architecture';
  const h = window.location.hash.replace('#', '');
  return isTab(h) ? h : 'architecture';
};

/** Repository URL, shown in the header. Update if the repo is renamed. */
const REPO_URL = 'https://github.com/';

export default function App() {
  const [tab, setTab] = useState<TabId>(readHash);
  const [dark, setDark] = useState(false);
  const sim = useSimulation();

  // Theme: honour the OS preference on first load, then remember the choice
  // for the session. No storage API is used, so this resets on reload.
  useEffect(() => {
    setDark(window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0b0d09' : '#ffffff');
  }, [dark]);

  // Deep-linkable tabs, so a section can be shared or cited directly.
  useEffect(() => {
    const onHash = () => setTab(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((id: TabId) => {
    setTab(id);
    if (window.location.hash !== `#${id}`) window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-full w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:px-3 focus:py-2"
        style={{ background: 'var(--ryobi-green)', color: '#fff' }}
      >
        Skip to content
      </a>

      <header
        className="no-print sticky top-0 z-40 border-b"
        style={{
          borderColor: 'var(--border)',
          background: 'var(--header-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-5 md:px-9">
          <button
            onClick={() => go('architecture')}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="RYOBI Intelligence Layer — home"
          >
            <span
              className="flex items-center justify-center rounded-sm"
              style={{ width: 29, height: 29, background: 'var(--ryobi-green)' }}
            >
              <Zap size={16} color="#fff" />
            </span>
            <span
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.02em' }}
            >
              RYOBI
            </span>
            <span
              className="hidden sm:inline"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                letterSpacing: '0.1em',
                color: 'var(--muted-foreground)',
              }}
            >
              / INTELLIGENCE LAYER
            </span>
          </button>

          <nav
            className="hide-scrollbar flex shrink-0 overflow-x-auto rounded-full border p-1"
            style={{ borderColor: 'var(--border)' }}
            role="tablist"
            aria-label="Sections"
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => go(t.id)}
                className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors"
                style={{
                  background: tab === t.id ? 'var(--foreground)' : 'transparent',
                  color: tab === t.id ? 'var(--background)' : 'var(--muted-foreground)',
                  fontSize: 13,
                  fontWeight: tab === t.id ? 600 : 400,
                }}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={dark ? 'Light theme' : 'Dark theme'}
              className="flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Source repository"
              className="hidden h-9 w-9 items-center justify-center rounded-md border transition-colors sm:flex"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
            >
              <Github size={15} />
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[1280px] px-5 py-10 md:px-9 md:py-14">
        {tab === 'architecture' && <ArchitectureView onOpenPipeline={() => go('pipeline')} />}
        {tab === 'pipeline' && <PipelineView sim={sim} />}
        {tab === 'insights' && <InsightsView />}
        {tab === 'economics' && <EconomicsView />}
      </main>

      <footer className="mx-auto w-full max-w-[1280px] px-5 pb-12 md:px-9">
        <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'var(--muted-foreground)' }}>
            <strong style={{ color: 'var(--foreground)' }}>Illustrative simulation.</strong> Payloads
            are modelled on the Sprout Analytics API, the Anthropic Messages API, and Slack Block Kit,
            and are generated from scenario data rather than transcribed from live systems. No
            network calls are made and no credentials are used. Governance is enforced throughout:
            every model output is a recommendation flagged for human review, and nothing is
            auto-posted.
          </p>
          <p className="mt-3" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            Built for the RYOBI / TTI social intelligence consulting project. RYOBI, Sprout Social,
            Slack, and DEWALT are trademarks of their respective owners and are referenced here for
            academic illustration only.
          </p>
        </div>
      </footer>
    </div>
  );
}
