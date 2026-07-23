# RYOBI Intelligence Layer

An interactive simulation of the AI-powered social intelligence pipeline proposed for RYOBI's
marketing team: **Sprout Social** as the data layer, an **orchestrator** as the connective layer,
**Claude** as the reasoning layer, and the **marketing team** as the decision layer.

Built as the working prototype for the Solution Design and Prototype section of the MB375
consulting report.

> **This is an illustrative simulation.** It makes no network calls and uses no credentials.
> Payloads are modelled on the shape of the Sprout Analytics API, the Anthropic Messages API, and
> Slack Block Kit, and are generated from scenario data rather than transcribed from live systems.

---

## What it demonstrates

| View | What it answers |
|---|---|
| **Architecture** | Why four layers, and why the orchestrator is structural rather than optional |
| **Pipeline** | The five-stage run, end to end, with every payload derived live |
| **Insights** | The library of synthesised insights, categorised and searchable |
| **Economics** | What the pipeline actually costs, computed by the same engine |

### The simulation is real, not scripted

The most important design decision here: **a scenario is pure data, and the engine derives every
artifact from it.** `runPipeline()` in `src/app/sim/engine.ts` takes a scenario, a model, a batch
flag, and a set of faults, and returns a complete `RunTrace` — log events with simulated timestamps,
stage durations, token counts, cost, retries, confidence, and gate outcome.

Nothing shown to the user is a hand-written string pretending to be an API response. Change the
scenario or switch the model and all five stages recompute. The function is pure: the same inputs
always produce the same trace.

### Fault injection

Four faults can be toggled, each mapped to a named entry in the report's risk register:

| Fault | Risk it stands in for | How the design absorbs it |
|---|---|---|
| Sprout API 429 | Vendor throttling in a high-volume window | Exponential backoff; the run completes late, not never |
| TikTok schema change | Breaking platform API change — the maintenance exposure that ruled out Option C | Partial-data degradation; the gap is flagged and confidence drops |
| Claude 529 overloaded | Upstream capacity pressure | Retry with jitter |
| Low-confidence synthesis | **Risk 1** — hallucination or unsupported inference | The governance gate **holds delivery** below 0.60 and routes to human review |

The fourth is the one worth demonstrating in a presentation. It shows the human-in-the-loop control
doing something, rather than being asserted in a bullet point. The pipeline is designed to be late
rather than wrong.

### Governance is enforced in the model

The run does not complete until a person clicks Approve, Request revision, or Reject. Decisions are
written to an audit trail with model, confidence, and timestamp attached. `auto_post` is `false` in
every delivery payload the engine emits.

---

## Running locally

Requires Node 20 or newer.

```bash
npm install
npm run dev      # development server on http://localhost:5173
npm run build    # production build to dist/
npm run preview  # serve the production build locally
npm run typecheck
```

---

## Deploying to GitHub Pages

The repository ships with a workflow at `.github/workflows/deploy.yml` that type-checks, builds, and
publishes on every push to `main`.

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main`, or run the workflow manually from the **Actions** tab.

The site will be published at `https://<username>.github.io/<repository>/`.

**Why it works at a sub-path.** `vite.config.ts` sets `base: './'`, so all asset URLs are relative.
The same build runs correctly at a domain root, at a project sub-path, and from the local
filesystem — no configuration change needed when the repository is renamed. A `.nojekyll` file in
`public/` stops GitHub from running the output through Jekyll.

Optionally, update `REPO_URL` in `src/app/App.tsx` so the header's GitHub link points at your
repository.

---

## Project structure

```
src/
├── main.tsx                     entry point
├── styles/
│   ├── theme.css                design tokens, light and dark
│   ├── tailwind.css             Tailwind v4 entry
│   └── fonts.css                Archivo · Inter · JetBrains Mono
└── app/
    ├── App.tsx                  shell, hash routing, theme toggle
    ├── components/
    │   └── Primitives.tsx       shared UI primitives
    ├── data/
    │   └── insights.ts          the insight library
    ├── views/
    │   ├── ArchitectureView.tsx four-layer model
    │   ├── PipelineView.tsx     the simulation
    │   ├── InsightsView.tsx     searchable library
    │   └── EconomicsView.tsx    cost and hours model
    └── sim/
        ├── types.ts             the domain model
        ├── scenarios.ts         four scenarios, as pure data
        ├── pricing.ts           token pricing and conversion
        ├── engine.ts            runPipeline() — the simulation core
        ├── useSimulation.ts     playback: transport, speed, gate
        └── components/          stage rail, code panel, log, brief, gate
```

---

## Keyboard shortcuts

Available on the Pipeline view.

| Key | Action |
|---|---|
| <kbd>Space</kbd> | Run / pause |
| <kbd>→</kbd> | Next stage |
| <kbd>←</kbd> | Previous stage |
| <kbd>R</kbd> | Reset |

---

## A note on the numbers

The Economics view computes from published per-million token rates and converts at the same 1.41
CAD/USD rate used in Appendix D, so its figures reconcile with the report's budget tables rather
than floating free of them.

Two caveats are stated in the interface itself and are repeated here because they matter:

- **Token counts are estimates.** Four characters per token is the conventional English-text
  approximation. The output is order-of-magnitude, not invoice-accurate.
- **Modelled API spend comes in well under the budgeted line.** This is not a saving to claim. Token
  cost is genuinely trivial for summarisation over pre-structured data, and the budgeted figure
  carries deliberate headroom for higher run volumes and interactive use. The defensible conclusion
  is that model routing is not where this budget is at risk — the Sprout-priced lines and the
  exchange rate are.

The hours model exposes its assumption with a slider rather than asserting a single figure. The
residual 36% that stays manual is deliberate: review, approval, and creative judgement are the parts
the design refuses to automate, so they are excluded from the savings.

---

## Accessibility and performance

- Semantic landmarks, a skip link, ARIA tab and radio-group roles, and labelled controls
- Visible focus rings; the log console is an `aria-live` region
- `prefers-reduced-motion` is honoured — animation collapses to instant reveal
- `prefers-color-scheme` sets the initial theme
- No browser storage APIs are used
- Three runtime dependencies: `react`, `react-dom`, `lucide-react`

## Tech stack

React 18 · TypeScript 5.6 (strict) · Vite 6 · Tailwind CSS 4 · lucide-react

## License

MIT — see [LICENSE](LICENSE). Trademarks referenced belong to their respective owners and appear
here for academic illustration only.
