# Sourcegraph MCP Use cases

A scripted demo UI for solutions engineers showing how agent outcomes differ **with** vs **without** Sourcegraph MCP as a context source.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

For offline demos: `npm run build && npx serve dist`


## Use cases

| Key | Scenario | Example repo |
|-----|----------|--------------|
| 1 | Understanding existing code | microsoft/vscode |
| 2 | Code reuse & consistency | apache/flink |
| 3 | Feature development / planning | sourcegraph/sourcegraph |
| 4 | Bug fixing & tests | grafana/grafana |
| 5 | Investigating an incident | grafana/grafana |
| 6 | Security | apache/kafka |
| 7 | Audit | apache/kafka |

## Editing scenarios

Scenarios are organized as **one folder per use case**, with **one subfolder per prompt** (sub-scenario):

```
src/scenarios/
  prompt-metrics.ts
  index.ts
  understand-existing-code/
    index.ts                          # scenario metadata + prompt imports
    cross-repo-discovery/
      index.ts                        # prompt metadata, metrics, log imports
      timeline.ts                     # withoutMCP / withMCP scripted events
      without-mcp.claude.log          # live run log (replace manually)
      with-mcp.claude.log             # live run log (replace manually)
    architecture-comprehension/
      ...
  code-reuse-consistency/
    ...
```

Each scenario `index.ts` only wires sub-scenarios together:

```ts
import type { Scenario } from "../../types/scenario";
import { crossRepoDiscoveryPrompt } from "./cross-repo-discovery";

export const understandExistingCode: Scenario = {
  id: "understand-existing-code",
  title: "Understanding existing code",
  subtitle: "Explore unfamiliar codebases",
  repo: "microsoft/vscode",
  prompts: [crossRepoDiscoveryPrompt],
};
```

Each sub-scenario folder owns the scripted timeline and execution logs:

```ts
import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const crossRepoDiscoveryPrompt: ScenarioPrompt = {
  id: "cross-repo-discovery",
  label: "Cross-repo dependency / hidden repo discovery",
  text: "How does Settings Sync handle…",
  metrics: promptMetrics.understandSettingsSync,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
```

### Adding live execution logs

After running Claude for real, drop the raw log text into the matching sub-scenario folder:

- `without-mcp.claude.log` — agent run without Sourcegraph MCP
- `with-mcp.claude.log` — agent run with Sourcegraph MCP

No upload UI: replace the placeholder files in git. The demo exposes a **Download log** button on each agent column so viewers can save the bundled log as proof of live execution.

Register new scenarios in `src/scenarios/index.ts`.

## Stack

- Vite + React + TypeScript
- Sourcegraph-inspired dark theme (CSS tokens in `src/styles/tokens.css`)
