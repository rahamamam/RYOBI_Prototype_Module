import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { MODELS } from '../pricing';
import type { SimulationApi, Speed } from '../useSimulation';
import { STAGES } from '../engine';

const SPEEDS: Speed[] = [0.5, 1, 2, 8];

function GhostButton({
  onClick,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex items-center gap-1.5 rounded-md border px-3 py-2.5 transition-colors disabled:opacity-35"
      style={{ borderColor: 'var(--border)', fontSize: 13.5 }}
    >
      {children}
    </button>
  );
}

export function ControlBar({ sim }: { sim: SimulationApi }) {
  const { running, started, atEnd, atStart, stageIndex } = sim;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={running ? sim.pause : sim.run}
          className="flex items-center gap-2 rounded-md px-4 py-2.5 transition-opacity hover:opacity-90"
          style={{ background: 'var(--ryobi-green)', color: '#fff', fontSize: 14, fontWeight: 600 }}
        >
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : !started ? 'Run pipeline' : atEnd ? 'Run again' : 'Restart'}
        </button>

        <GhostButton onClick={sim.back} disabled={!started || atStart} label="Previous stage">
          <ChevronLeft size={15} />
        </GhostButton>

        <GhostButton onClick={sim.step} disabled={atEnd && started} label="Next stage">
          Step <ChevronRight size={15} />
        </GhostButton>

        <GhostButton onClick={sim.reset} disabled={!started} label="Reset the run">
          <RotateCcw size={14} /> Reset
        </GhostButton>

        <div
          className="flex overflow-hidden rounded-md border"
          style={{ borderColor: 'var(--border)' }}
          role="group"
          aria-label="Playback speed"
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => sim.setSpeed(s)}
              aria-pressed={sim.speed === s}
              className="px-2.5 py-2.5 transition-colors"
              style={{
                background: sim.speed === s ? 'var(--foreground)' : 'transparent',
                color: sim.speed === s ? 'var(--background)' : 'var(--muted-foreground)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
              }}
            >
              {s === 8 ? 'skip' : `${s}\u00d7`}
            </button>
          ))}
        </div>

        <div
          className="ml-auto tabular"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--muted-foreground)' }}
        >
          stage {stageIndex < 0 ? 0 : stageIndex + 1} / {STAGES.length}
        </div>
      </div>

      {/* Model routing */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            letterSpacing: '0.09em',
            color: 'var(--muted-foreground)',
          }}
        >
          Model routing
        </span>

        <div
          className="flex overflow-hidden rounded-md border"
          style={{ borderColor: 'var(--border)' }}
          role="group"
          aria-label="Model selection"
        >
          {Object.values(MODELS).map((m) => (
            <button
              key={m.id}
              onClick={() => sim.setModel(m.id)}
              aria-pressed={sim.model === m.id}
              title={m.role}
              className="px-3 py-2 transition-colors"
              style={{
                background: sim.model === m.id ? 'var(--ryobi-green)' : 'transparent',
                color: sim.model === m.id ? '#fff' : 'var(--muted-foreground)',
                fontSize: 12.5,
                fontWeight: sim.model === m.id ? 600 : 400,
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => sim.setBatch(!sim.batch)}
          aria-pressed={sim.batch}
          title="The Batch API halves token cost for runs that are not time-critical."
          className="rounded-md border px-3 py-2 transition-colors"
          style={{
            borderColor: sim.batch ? 'var(--ryobi-green)' : 'var(--border)',
            background: sim.batch ? 'var(--accent)' : 'transparent',
            color: sim.batch ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
            fontSize: 12.5,
          }}
        >
          Batch API {sim.batch ? 'on' : 'off'} · {'\u2212'}50%
        </button>
      </div>
    </div>
  );
}
