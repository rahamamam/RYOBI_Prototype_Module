import { Stat } from '../../components/Primitives';
import { fmtUsd } from '../pricing';
import type { RunTrace } from '../types';

export function RunMetrics({ trace, started }: { trace: RunTrace; started: boolean }) {
  const seconds = trace.totalMs / 1000;
  const manualMinutes = trace.manualHours * 60;
  const speedup = Math.round(manualMinutes * 60 / seconds);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat
        label="Pipeline latency"
        value={started ? `${seconds.toFixed(1)}s` : '—'}
        hint={trace.retries > 0 ? `${trace.retries} retr${trace.retries === 1 ? 'y' : 'ies'} absorbed` : 'no retries needed'}
      />
      <Stat
        label="Tokens this run"
        value={started ? `${(trace.usage.input + trace.usage.output).toLocaleString()}` : '—'}
        hint={started ? `${trace.usage.input.toLocaleString()} in · ${trace.usage.output.toLocaleString()} out` : undefined}
      />
      <Stat
        label="Cost this run"
        value={started ? fmtUsd(trace.costUsd) : '—'}
        color="var(--ryobi-green)"
        hint={trace.batch ? 'Batch API rate applied' : 'standard rate'}
      />
      <Stat
        label="Manual equivalent"
        value={`${trace.manualHours.toFixed(1)}h`}
        hint={started ? `~${speedup.toLocaleString()}× faster` : 'analyst time to reproduce'}
      />
    </div>
  );
}
