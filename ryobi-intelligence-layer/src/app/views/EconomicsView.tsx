import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { Callout, Eyebrow, Lede, PageTitle, Panel, Stat } from '../components/Primitives';
import { runPipeline } from '../sim/engine';
import { scenarioById } from '../sim/scenarios';
import {
  ANALYST_RATE_CAD,
  BUDGET_API_LINE_CAD,
  MODELS,
  PRODUCTION_SCALE,
  USD_TO_CAD,
  costOf,
  fmtCad,
  fmtUsd,
} from '../sim/pricing';
import type { ModelId } from '../sim/types';

/** Production cadence as described in the implementation roadmap. */
const CADENCES = [
  { id: 'daily' as const, label: 'Daily brief', runs: 365, scenario: 'community-health', model: 'haiku-4-5' as ModelId },
  { id: 'weekly' as const, label: 'Weekly memo', runs: 52, scenario: 'format-decline', model: 'haiku-4-5' as ModelId },
  { id: 'monthly' as const, label: 'Monthly strategic report', runs: 12, scenario: 'monthly-strategic', model: 'sonnet' as ModelId },
];

/** The report's own figures, so the model can be checked against them. */
const REPORTED_RECLAIM_HOURS = 500;

export function EconomicsView() {
  const [batch, setBatch] = useState(true);
  const [hoursPerWeek, setHoursPerWeek] = useState(15);
  const [volume, setVolume] = useState(1);

  const lines = useMemo(
    () =>
      CADENCES.map((c) => {
        const trace = runPipeline({
          scenario: scenarioById(c.scenario),
          model: c.model,
          batch,
          faults: [],
        });
        // Scale the on-screen demo payload up to a realistic production size,
        // then apply the volume sensitivity factor.
        const scale = PRODUCTION_SCALE[c.id];
        const usage = {
          input: Math.round(trace.usage.input * scale.input * volume),
          output: Math.round(trace.usage.output * scale.output * volume),
        };
        const perRunUsd = costOf(c.model, usage, batch);
        const annualUsd = perRunUsd * c.runs;
        return {
          ...c,
          perRunUsd,
          tokens: usage.input + usage.output,
          annualUsd,
          annualCad: annualUsd * USD_TO_CAD,
          modelName: MODELS[c.model].name,
        };
      }),
    [batch, volume],
  );

  const totalAnnualUsd = lines.reduce((s, l) => s + l.annualUsd, 0);
  const totalAnnualCad = totalAnnualUsd * USD_TO_CAD;
  const headroom = BUDGET_API_LINE_CAD - totalAnnualCad;
  const utilisation = (totalAnnualCad / BUDGET_API_LINE_CAD) * 100;

  // Hours model. The baseline is the partner-reported 10–20 h/week on
  // collection, analysis, and reporting; the residual is the review and
  // decision work that stays human by design.
  const baselineAnnual = hoursPerWeek * 52;
  const residualAnnual = Math.round(baselineAnnual * 0.36);
  const reclaimed = baselineAnnual - residualAnnual;
  const reclaimedValue = reclaimed * ANALYST_RATE_CAD;

  return (
    <>
      <Eyebrow>Modelled, not asserted</Eyebrow>
      <PageTitle>
        What the pipeline <span style={{ color: 'var(--ryobi-green)' }}>actually costs</span>.
      </PageTitle>
      <Lede>
        Every figure below is computed by the same engine that drives the simulation — token counts
        estimated from the real payload sizes, priced at published per-million rates, converted at
        the 1.41 rate Appendix D uses. Change the assumptions and the numbers move.
      </Lede>

      {/* Headline */}
      <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Modelled API spend / yr"
          value={fmtCad(totalAnnualCad)}
          hint={`${fmtUsd(totalAnnualUsd)} USD`}
          color="var(--ryobi-green)"
        />
        <Stat label="Budgeted (Table D1)" value={fmtCad(BUDGET_API_LINE_CAD)} hint="Claude API line" />
        <Stat
          label="Headroom on that line"
          value={fmtCad(headroom)}
          hint={`${utilisation.toFixed(1)}% utilised`}
          color="var(--status-info)"
        />
        <Stat
          label="Hours reclaimed / yr"
          value={`${reclaimed}h`}
          hint={`≈ ${fmtCad(reclaimedValue)} of analyst time`}
        />
      </div>

      {/* Cost table */}
      <Panel className="mt-6 overflow-hidden">
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3"
          style={{ borderColor: 'var(--border)' }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>Annual API cost by cadence</span>
          <div className="flex flex-wrap items-center gap-3">
            <label
              className="flex items-center gap-2"
              style={{ fontSize: 12.5, color: 'var(--muted-foreground)' }}
            >
              <span>Volume {volume.toFixed(1)}×</span>
              <input
                type="range"
                min={0.5}
                max={10}
                step={0.5}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                aria-label="Payload volume multiplier"
                style={{ accentColor: 'var(--ryobi-green)', width: 110 }}
              />
            </label>
          <button
            onClick={() => setBatch(!batch)}
            aria-pressed={batch}
            className="rounded-md border px-3 py-1.5 transition-colors"
            style={{
              borderColor: batch ? 'var(--ryobi-green)' : 'var(--border)',
              background: batch ? 'var(--accent)' : 'transparent',
              color: batch ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
              fontSize: 12.5,
            }}
          >
            Batch API {batch ? 'on' : 'off'}
          </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['Cadence', 'Model', 'Runs / yr', 'Tokens / run', 'Cost / run', 'Annual (CAD)'].map(
                  (h, i) => (
                    <th
                      key={h}
                      className="px-4 py-2.5"
                      style={{
                        textAlign: i >= 2 ? 'right' : 'left',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10.5,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--muted-foreground)',
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5" style={{ fontWeight: 600 }}>
                    {l.label}
                  </td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--muted-foreground)' }}>
                    {l.modelName}
                  </td>
                  <td className="tabular px-4 py-2.5" style={{ textAlign: 'right' }}>
                    {l.runs}
                  </td>
                  <td className="tabular px-4 py-2.5" style={{ textAlign: 'right' }}>
                    {l.tokens.toLocaleString()}
                  </td>
                  <td className="tabular px-4 py-2.5" style={{ textAlign: 'right' }}>
                    {fmtUsd(l.perRunUsd)}
                  </td>
                  <td
                    className="tabular px-4 py-2.5"
                    style={{ textAlign: 'right', fontWeight: 600 }}
                  >
                    {fmtCad(l.annualCad)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '1.5px solid var(--border)', background: 'var(--accent)' }}>
                <td className="px-4 py-3" style={{ fontWeight: 700 }} colSpan={5}>
                  Total modelled API spend
                </td>
                <td
                  className="tabular px-4 py-3"
                  style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-foreground)' }}
                >
                  {fmtCad(totalAnnualCad)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4">
        <Callout>
          <strong>Read this honestly.</strong> The modelled API spend comes in far under the{' '}
          {fmtCad(BUDGET_API_LINE_CAD)} budgeted on that line — around{' '}
          {utilisation < 1 ? 'well under one percent' : `${utilisation.toFixed(1)}%`} of it. That is
          not a saving to claim. Token cost is genuinely trivial for summarisation over
          pre-structured data, and the budgeted figure carries deliberate headroom for higher run
          volumes, longer context windows, and interactive use beyond the automated pipeline. Push
          the volume slider to {'10\u00d7'} and the line still holds. The defensible conclusion is
          that model routing is not where this budget is at risk — the Sprout-priced lines and the
          exchange rate are.
        </Callout>
      </div>

      {/* Model routing comparison */}
      <h2 className="mt-10" style={{ fontSize: 22, fontWeight: 700 }}>
        Why route by task rather than default to the largest model
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {Object.values(MODELS).map((m) => {
          const daily = runPipeline({
            scenario: scenarioById('community-health'),
            model: m.id,
            batch,
            faults: [],
          });
          const scaled = {
            input: Math.round(daily.usage.input * PRODUCTION_SCALE.daily.input),
            output: Math.round(daily.usage.output * PRODUCTION_SCALE.daily.output),
          };
          const annual = costOf(m.id, scaled, batch) * 365 * USD_TO_CAD;
          return (
            <Panel key={m.id} className="p-5">
              <div className="flex items-baseline justify-between gap-2">
                <span style={{ fontSize: 15.5, fontWeight: 700 }}>{m.name}</span>
                <span
                  className="tabular"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted-foreground)' }}
                >
                  ${m.inputRate} / ${m.outputRate} per MTok
                </span>
              </div>
              <p className="mt-1.5" style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                {m.role}
              </p>
              <div className="mt-4 flex items-end gap-4">
                <div>
                  <div
                    className="tabular"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 24,
                      fontWeight: 800,
                      color: 'var(--ryobi-green)',
                    }}
                  >
                    {fmtCad(annual)}
                  </div>
                  <div
                    style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                  >
                    if it ran the daily brief all year
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="tabular" style={{ fontSize: 15, fontWeight: 600 }}>
                    {Math.round((m.latency[0] + m.latency[1]) / 2)}ms
                  </div>
                  <div
                    style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                  >
                    typical latency
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <p className="mt-4" style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
        The gap is real but small in absolute terms — which is the point. The case for routing is not
        primarily cost; it is that the digest is mechanical compression over data that is already
        structured, while the monthly report reads thirty days against ninety and genuinely benefits
        from the larger model. Interactive drafting by the five marketers never touches the digest
        model at all. Matching model to task, not corner-cutting.
      </p>

      {/* Hours model */}
      <h2 className="mt-10" style={{ fontSize: 22, fontWeight: 700 }}>
        Hours reclaimed — with the assumption exposed
      </h2>
      <Panel className="mt-4 p-5">
        <label
          className="block"
          style={{ fontSize: 13, fontWeight: 600 }}
          htmlFor="baseline-hours"
        >
          Baseline manual hours per week
        </label>
        <p className="mt-1" style={{ fontSize: 12.5, color: 'var(--muted-foreground)' }}>
          The partner reported 10–20 hours weekly on collection, competitive monitoring, analysis,
          and reporting. Drag to test the sensitivity of the claim.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            id="baseline-hours"
            type="range"
            min={8}
            max={22}
            step={1}
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(Number(e.target.value))}
            className="w-full max-w-md"
            style={{ accentColor: 'var(--ryobi-green)' }}
          />
          <span
            className="tabular shrink-0"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600 }}
          >
            {hoursPerWeek} h/wk
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Baseline / yr" value={`${baselineAnnual}h`} />
          <Stat
            label="Residual (stays human)"
            value={`${residualAnnual}h`}
            hint="review, decisions, creative"
          />
          <Stat label="Reclaimed / yr" value={`${reclaimed}h`} color="var(--ryobi-green)" />
          <Stat
            label="Valued at"
            value={fmtCad(reclaimedValue)}
            hint={`@ ${fmtCad(ANALYST_RATE_CAD)}/h blended`}
          />
        </div>

        <div
          className="mt-4 flex gap-2 rounded-md p-3"
          style={{ background: 'var(--muted)', fontSize: 12.5, lineHeight: 1.55 }}
        >
          <Info size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--status-info)' }} />
          <span style={{ color: 'var(--muted-foreground)' }}>
            At the 15 h/week midpoint this model returns roughly {reclaimed} hours — close to the{' '}
            {REPORTED_RECLAIM_HOURS}-hour figure cited in the report, which is the point of exposing
            the assumption rather than asserting the output. The residual 36% is deliberate: review,
            approval, and creative judgement are the parts the design refuses to automate, so they
            never appear in the savings.
          </span>
        </div>
      </Panel>

      <p
        className="mt-8"
        style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--muted-foreground)' }}
      >
        Token counts are estimated at four characters per token, the conventional English-text
        approximation, and are intended to be order-of-magnitude rather than invoice-accurate. The
        payloads shown in the simulation are trimmed for legibility; the cost model scales them to a
        realistic production size before pricing, and the volume control above exposes the
        sensitivity of that assumption.
        Latency figures are illustrative. Currency conversion uses the same 1.41 CAD/USD rate as
        Appendix D and will move with the market on the day a contract is signed.
      </p>
    </>
  );
}
