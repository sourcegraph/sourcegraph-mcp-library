# Sourcegraph MCP Use cases

A scripted demo UI for solutions engineers showing how agent outcomes differ **with** vs **without** Sourcegraph MCP as a context source.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). (If port 5173 is in use, Vite will pick the next free port and print it.)

## Production build

```bash
npm run build
npm run preview
```

For offline demos: `npm run build && npx serve dist`

## Keyboard shortcuts

- `1`–`N` — jump to scenario _N_ in the sidebar (where _N_ is the total number of scenarios)
- Press the **same** number again to replay the current scenario from time 0
- Cmd/Ctrl/Alt modifiers are ignored so browser shortcuts (e.g. ⌘1 for tab switching) still work

## Use cases

| Key | Scenario | Example repo |
|-----|----------|--------------|
| 1 | Understanding existing code | microsoft/vscode |
| 2 | Code reuse & consistency | apache/flink |
| 3 | Feature development | sourcegraph/sourcegraph |
| 4 | Bug fixing & tests | grafana/grafana |
| 5 | Investigating an incident | grafana/grafana |
| 6 | Security | apache/kafka |
| 7 | Audit | apache/kafka |

## Editing scenarios

Scenarios are organized as **one folder per use case**, with **one subfolder per prompt** (sub-scenario):

```
src/scenarios/
  prompt-metrics.ts                   # shared metrics keyed by prompt
  index.ts                            # registers all scenarios
  security/
    index.ts                          # scenario metadata + prompt imports
    acl-code-audit/
      index.ts                        # prompt metadata, metrics, log imports
      timeline.ts                     # withoutMCP / withMCP scripted events
      without-mcp.claude.log          # live run log (replace manually)
      with-mcp.claude.log             # live run log (replace manually)
    acl-bypass-review/
      ...
```

Each scenario `index.ts` only wires sub-scenarios together:

```ts
import type { Scenario } from "../../types/scenario";
import { aclBypassReviewPrompt } from "./acl-bypass-review";
import { aclCodeAuditPrompt } from "./acl-code-audit";

export const security: Scenario = {
  id: "security",
  title: "Security",
  subtitle: "Authorization risks & vulnerability discovery",
  repo: "apache/kafka",                              // shown as a small mono-font link
  repoUrl: "https://github.com/apache/kafka",        // optional; defaults to github.com/<repo>
  prompts: [aclBypassReviewPrompt, aclCodeAuditPrompt],
};
```

### Adding a new sub-scenario (prompt)

The best reference is [`src/scenarios/security/acl-code-audit/index.ts`](src/scenarios/security/acl-code-audit/index.ts) — it exercises every field. A `ScenarioPrompt` looks like this:

```ts
import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const myPrompt: ScenarioPrompt = {
  // ─── Required ─────────────────────────────────────────────
  id: "acl-code-audit",
  label: "ACL authorization code audit",  // sidebar label
  text: "Find all Java source files …",   // the actual user prompt
  metrics: promptMetrics.aclCodeAudit,    // see "Metrics" below
  withoutMCP,                             // scripted timeline events
  withMCP,                                // scripted timeline events
  logs: {
    withoutMCP: withoutMcpLog,            // bundled .claude.log text
    withMCP: withMcpLog,
  },

  // ─── Optional ─────────────────────────────────────────────
  environment: "multi-repo",              // display chip: "multi-repo" | "mono-repo"
  qualityBreakdown: [ /* see "Quality breakdown" below */ ],
};
```

### Metrics (`src/scenarios/prompt-metrics.ts`)

Add an entry keyed by your prompt. Every field on `ExecutionMetrics` is **optional** — include only what you have real data for; missing metrics are hidden in the UI.

```ts
aclCodeAudit: {
  withoutMCP: { timeSeconds: 163, costUsd: 0.26, quality: 0, toolCalls: 483 },
  withMCP:    { timeSeconds: 145, costUsd: 0.28, quality: 1, toolCalls: 42 },
},
```

Available fields: `timeSeconds`, `costUsd`, `quality` (0.0–1.0), `toolCalls`. A minimal entry with only `timeSeconds` and `costUsd` is fine (see `securityAclBypass` for an example).

### Quality breakdown (optional)

`qualityBreakdown` renders a side-by-side scoring table below the two agent columns. **Omit the field entirely** if you don't have a meaningful per-dimension comparison — most scripted scenarios skip it and only the runs with real evaluation data (like `acl-code-audit`) include one.

Each row has three required fields and one optional one:

```ts
qualityBreakdown: [
  {
    dimension: "File Recall",                  // row label (left column)
    baseline: "21/25 (84%)",                   // "without MCP" value
    mcp: "25/25 (100%)",                       // "with MCP" value
    notes: "Baseline missed metadata files…",  // optional explanation
  },
  {
    dimension: "Final Reward",
    baseline: "0.00 ❌",
    mcp: "1.00 ✅",
    notes: "MCP passed; baseline failed.",
  },
],
```

All cell values are **free-form strings**, so you can mix percentages, fractions, qualitative labels, and unicode indicators (`✅` / `❌` / `✓` / `✕`) however reads best. See [`src/scenarios/security/acl-code-audit/index.ts`](src/scenarios/security/acl-code-audit/index.ts) for a full 6-row example covering recall, coverage, approach, tool calls, output structure, and final reward.

### Timeline events (`timeline.ts`)

Both `withoutMCP` and `withMCP` are arrays of `TimelineEvent`s. The two columns play **in parallel** from time 0, and `at` is **milliseconds from playback start**.

| `type` | Required fields | Notes |
|---|---|---|
| `user` | `at`, `text` | Renders a user message bubble. |
| `assistant` | `at`, `text`, optional `stream: true` | `stream: true` triggers the typewriter effect. Playback duration auto-accounts for streaming time, so metrics never reveal mid-stream. |
| `tool` | `at`, `name`, `args`, optional `status: "running" \| "done"` | Re-emitting the same `name + args` later transitions the card **in place** (running → done) without remounting. |
| `complete` | `at` | **Required.** Reveals the metrics bar, savings line, and quality breakdown. Without it the demo never finishes. |

Example:

```ts
import type { TimelineEvent } from "../../../types/scenario";

export const withMCP: TimelineEvent[] = [
  { at: 200,  type: "assistant", text: "I'll search the codebase.", stream: true },
  { at: 500,  type: "tool", name: "sg_keyword_search", args: "{ query: \"…\" }", status: "running" },
  { at: 1100, type: "tool", name: "sg_keyword_search", args: "{ query: \"…\" }", status: "done" },
  { at: 5300, type: "assistant", text: "Found 20 files across 4 directories…", stream: true },
  { at: 6500, type: "complete" },
];
```

### Adding live execution logs

After running the agent for real, drop the raw log text into the matching sub-scenario folder:

- `without-mcp.claude.log` — agent run without Sourcegraph MCP
- `with-mcp.claude.log` — agent run with Sourcegraph MCP

No upload UI: replace the placeholder files in git. The demo exposes a **Download log** button on each agent column so viewers can save the bundled log as proof of live execution.

Register new scenarios in [`src/scenarios/index.ts`](src/scenarios/index.ts).

## Stack

- Vite + React + TypeScript
- All theme colors, fonts, and radii live in [`src/styles/tokens.css`](src/styles/tokens.css) — change them there to retheme the whole UI.

## Accessibility

The demo honors `prefers-reduced-motion: reduce`: the typewriter streaming is skipped and assistant text appears in full. If you're testing in macOS Settings → Accessibility → Display → Reduce motion (or the equivalent on other OSes), this is expected behavior, not a broken demo.
