import { scenarios } from '../scenarios';
import type { SimulationApi } from '../useSimulation';

const cadenceTone: Record<string, string> = {
  daily: 'var(--ryobi-green)',
  weekly: 'var(--status-info)',
  monthly: 'var(--status-warn)',
};

export function ScenarioPicker({ sim }: { sim: SimulationApi }) {
  return (
    <div>
      <div
        className="uppercase"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          letterSpacing: '0.09em',
          color: 'var(--muted-foreground)',
        }}
      >
        Scenario · the pipeline re-derives on change
      </div>

      <div
        className="mt-2.5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
        role="radiogroup"
        aria-label="Simulation scenario"
      >
        {scenarios.map((s) => {
          const on = sim.scenarioId === s.id;
          return (
            <button
              key={s.id}
              role="radio"
              aria-checked={on}
              onClick={() => sim.setScenarioId(s.id)}
              className="rounded-md border p-3 text-left transition-colors"
              style={{
                borderColor: on ? 'var(--ryobi-green)' : 'var(--border)',
                background: on ? 'var(--accent)' : 'var(--card)',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{s.label}</span>
                <span
                  className="mt-0.5 shrink-0 rounded-full px-1.5 py-0.5 uppercase"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 8.5,
                    letterSpacing: '0.06em',
                    color: '#fff',
                    background: cadenceTone[s.cadence],
                  }}
                >
                  {s.cadence}
                </span>
              </div>
              <p
                className="mt-1.5"
                style={{ fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted-foreground)' }}
              >
                {s.tagline}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
