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

## Editing scenarios

Scenarios are organized as **one folder per use case**, with **one subfolder per prompt** (sub-scenario):

```
src/scenarios/
  index.ts                            # registers all scenarios
  security/
    index.ts                          # scenario metadata + prompt imports
    acl-code-audit/
      index.ts                        # prompt metadata, inline metrics, log imports
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
import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 163, costUsd: 0.26, quality: 0, toolCalls: 483 },
  withMCP:    { timeSeconds: 145, costUsd: 0.28, quality: 1, toolCalls: 42 },
};

export const myPrompt: ScenarioPrompt = {
  // ─── Required ─────────────────────────────────────────────
  id: "acl-code-audit",
  label: "ACL authorization code audit",  // sidebar label
  text: "Find all Java source files …",   // the actual user prompt
  metrics,                                // see "Metrics" below
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

### Metrics

Define the `metrics` constant inline in the prompt's `index.ts` (as shown above). Every field on `ExecutionMetrics` is **optional** — include only what you have real data for; missing metrics are hidden in the UI.

Available fields: `timeSeconds`, `costUsd`, `quality` (0.0–1.0), `toolCalls`. A minimal entry with only `timeSeconds` and `costUsd` is fine (see [`src/scenarios/security/acl-bypass-review/index.ts`](src/scenarios/security/acl-bypass-review/index.ts) for an example).

### Quality breakdown (optional)

`qualityBreakdown` renders a side-by-side scoring table below the two agent columns. **Omit the field entirely** if you don't have a meaningful per-dimension comparison — most scripted scenarios skip it and only the runs with real evaluation data (like `acl-code-audit`) include one.

Each row has three required fields and three optional fields:

```ts
qualityBreakdown: [
  {
    dimension: "File Recall",                      // row label (left column) — required
    weight: "0.30",                                // optional: weight in composite score
    definition: "Fraction of target files found", // optional: what this dimension measures
    baseline: "21/25 (84%)",                       // "without MCP" value — required
    mcp: "25/25 (100%)",                           // "with MCP" value — required
    notes: "Baseline missed metadata files…",      // optional explanation
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

> ⚠️ **`timeline.at` ≠ `metrics.timeSeconds`.** The `at` field is compressed playback time in **milliseconds** for the demo. It has no relationship to `metrics.timeSeconds` (the real-world run duration shown in the metrics chip). Even if the real agent took 13 minutes, the playback timeline should still fit in ~10–25 seconds. A dev-mode validator (`src/utils/validateScenario.ts`) will `console.warn` if any `at` exceeds 60 s.

| `type` | Required fields | Notes |
|---|---|---|
| `user` | `at`, `text` | Renders a user message bubble. |
| `assistant` | `at`, `text`, optional `stream: true` | `stream: true` triggers the typewriter effect. Playback duration auto-accounts for streaming time, so metrics never reveal mid-stream. |
| `tool` | `at`, `name`, `args`, optional `id`, optional `status: "running" \| "done"` | A later event with matching `id` (or, if `id` is omitted, identical `name + args`) transitions the card **in place** (running → done) without remounting. See the tool-transition gotcha below. |
| `complete` | `at` | **Required.** Marks the column as finished and reveals the metrics bar, savings line, and quality breakdown. The `at` value is **ignored** by the player — `complete` is auto-scheduled `COMPLETE_BUFFER_MS` after the last content finishes rendering. The event itself must still be present; use any placeholder `at`. |

#### Tool-transition gotcha

The matching between a `running` event and its later `done` event is strict and silent. The safest pattern is to give the pair an explicit `id`:

```ts
{ at: 500,  type: "tool", id: "kw1", name: "sg_keyword_search", args: "{ query: \"…\" }", status: "running" },
{ at: 1100, type: "tool", id: "kw1", name: "sg_keyword_search", args: "...",              status: "done"    },
```

If you omit `id`, the player falls back to matching by `name + args` against the most recent still-running tool. In that case the strings on the `done` event must be **byte-for-byte identical** to the `running` event — using a placeholder like `args: "..."` will silently leave the spinner running forever and append a second card. The dev-mode validator catches orphan running tools.

#### Storytelling through timeline

**The timeline must tell a story** — baseline struggling and MCP excelling. This means:

1. **Show the baseline's actual problem**, not just slower execution. If the baseline took a scattered approach (e.g., hunting for a grader instead of reading code), add tool calls that show this wasted effort. Add redundant searches, dead-end reads, and backtracking to make the exploration feel unfocused.

2. **Tool call density matters.** Don't leave long gaps between events. If your real run had 100 tool calls and the other had 40, your timeline should reflect ~2.5× as many tool events. This isn't filler — it shows the agent working harder without converging.

3. **Use tool calls to illustrate approach.** MCP should show targeted, semantic tool usage (keyword searches → file reads following a dependency chain). Baseline should show exploratory, repetitive tool usage (grep searches, multiple reads of the same file, dead-end file exploration). The tool sequence itself tells the story.

4. **Proportional timing matches proportional effort.** If real-world baseline took 810 seconds and MCP took 348 seconds (2.33× ratio), scale your timeline `at` values so baseline plays ~2.3× longer. Use `metrics.timeSeconds` as ground truth, then work backwards: if MCP timeline ends at 12,000ms, baseline should end around 28,000ms (12000 × 2.33). Distribute extra time to the phases that actually consumed it (large file reads, synthesis phases, redundant searches).

5. **Example distribution:** If baseline spent most extra time on file reading and synthesis, scale those phases more heavily. Verifier hunts and early exploration get modest scaling. This makes the timeline *honest* — the visual pacing aligns with how the agent actually spent time.

Example timeline structure (baseline):
```ts
// Wasted verifier hunt (1.3× scale)
{ at: 600,  type: "tool", name: "execute_bash", args: 'find / -name "*verify*.py"', status: "running" },
{ at: 2400, type: "tool", name: "execute_bash", args: 'find / -name "*verify*.py"', status: "done" },

// Scattered exploration (multiple reads of same file, then different files)
{ at: 4200, type: "tool", name: "read_file", args: "MainFile.java [1-100]", status: "done" },
{ at: 5100, type: "tool", name: "read_file", args: "MainFile.java [200-300]", status: "done" }, // backtrack
{ at: 6000, type: "tool", name: "read_file", args: "SideFile.java", status: "done" },          // dead end
{ at: 7500, type: "tool", name: "read_file", args: "MainFile.java [100-200]", status: "done" }, // backtrack again

// Heavy synthesis (extra padding here)
{ at: 25000, type: "tool", name: "write", args: "solution.md [large synthesis]", status: "done" },
```

#### Adding live execution logs

After running the agent for real, drop the raw log text into the matching sub-scenario folder:

- `without-mcp.claude.log` — agent run without Sourcegraph MCP
- `with-mcp.claude.log` — agent run with Sourcegraph MCP

No upload UI: replace the placeholder files in git. The demo exposes a **Download log** button on each agent column so viewers can save the bundled log as proof of live execution.

#### Testing your timeline

Run `npm run dev` and open the dev console (`F12`). The validator in `src/utils/validateScenario.ts` will warn about:
- Orphan `running` tools (no matching `done` event)
- Any `at` value exceeding 60000ms (usually a sign of a mismatch between intended duration and actual playback time)

Replay your scenario with the numeric keys to iterate on pacing.

#### Other important practices

1. **`index.ts` and `timeline.ts` serve different purposes:**
   - `index.ts`: Real metrics (`metrics.timeSeconds`, `metrics.toolCalls`, `metrics.quality`) and the quality breakdown table
   - `timeline.ts`: Playback choreography — compresses real time into ~10–25 seconds for demo readability
   - These don't have to match exactly. A 13-minute real run can become a 20-second timeline. What matters: the *ratio* between baseline and MCP should be proportional to the real ratio.

2. **Quality breakdown explains *why* MCP won.** Don't just show "Baseline: 0.16, MCP: 0.81". Add a row for each dimension (file recall, tool call efficiency, output structure, etc.) so viewers understand the root causes. See the flink-checkpoint-arch-001 scenario's breakdown for a full example.

3. **`metrics.toolCalls` is visual proof of efficiency.** If baseline had 2.36× more tool calls than MCP, the timeline should show this density. Don't compress it away.

4. **Baseline's struggle should be specific.** "Explored without clear guidance" is vague. Instead, show:
   - Searching for the wrong thing (verifier hunt, test files)
   - Redundant tool calls (grepping twice, reading the same file multiple times)
   - Dead-end exploration (reading files that don't belong in the critical path)
   - Late discovery of key files
   - Any output-format misalignment (if the scorer expected a specific structure)

5. **Assistant beats matter.** Intersperse tool calls with brief assistant narration to signal what the agent is thinking/trying. "No grader found — falling back to…" or "Reading 43+ files while searching for dependencies" helps viewers follow the mental journey.

6. **Logs are proof.** Include real `without-mcp.claude.log` and `with-mcp.claude.log` files. The "Download log" button lets viewers audit your timeline against ground truth. If the timeline doesn't match the logs, the demo loses credibility.

Register new scenarios in [`src/scenarios/index.ts`](src/scenarios/index.ts).

## Playback timing

All global pacing knobs live in [`src/utils/playbackTiming.ts`](src/utils/playbackTiming.ts) so the next person who wants "faster typewriter" or "longer reveal pause" doesn't have to spelunk:

| Constant | What it controls |
|---|---|
| `STREAM_CHARS_PER_TICK` | Characters revealed per typewriter tick during assistant streaming. Raise to speed up. |
| `STREAM_CHUNK_MS` | Milliseconds between typewriter ticks. Lower to speed up. |
| `COMPLETE_BUFFER_MS` | Delay between last visible content and the metrics bar appearing. |
| `PLAYBACK_TAIL_MS` | Extra grace before `isPlaying` flips off (mostly an internal detail). |

The metrics-bar fade-in itself is a CSS variable, `--metrics-reveal-duration` in [`src/styles/tokens.css`](src/styles/tokens.css), since CSS transitions can't read JS constants.

## Stack

- Vite + React + TypeScript
- All theme colors, fonts, and radii live in [`src/styles/tokens.css`](src/styles/tokens.css) — change them there to retheme the whole UI.

## Accessibility

The demo honors `prefers-reduced-motion: reduce`: the typewriter streaming is skipped and assistant text appears in full. If you're testing in macOS Settings → Accessibility → Display → Reduce motion (or the equivalent on other OSes), this is expected behavior, not a broken demo.
