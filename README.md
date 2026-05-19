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

## Using the demo

1. Pick a **use case** on the right (or press `1`–`7`).
2. Watch both agent columns play in sync (~6–10 seconds per scenario).
3. Click the same use case or environment again to re-run the demo.

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

Each scenario lives in `src/scenarios/` and supports **multiple prompts**:

```ts
export const myScenario: Scenario = {
  id: "my-scenario",
  title: "My use case",
  subtitle: "Short description",
  repo: "org/repo",
  prompts: [
    {
      id: "prompt-a",
      label: "Short tab label",
      text: "Full prompt shown in the demo toolbar",
      metrics: {
        withoutMCP: { timeSeconds: 1320, costUsd: 4.85 },
        withMCP: { timeSeconds: 445, costUsd: 1.52 },
      },
      withoutMCP: [/* timeline events */],
      withMCP: [/* timeline events */],
    },
    {
      id: "prompt-b",
      label: "Second prompt",
      text: "Another prompt for the same use case",
      withoutMCP: [],
      withMCP: [],
    },
  ],
};
```

Timelines use millisecond offsets:

```ts
{ at: 500, type: "tool", name: "keyword_search", args: '{ query: "..." }', status: "running" }
{ at: 1200, type: "confidence", value: 75 }
{ at: 3000, type: "missed", items: ["Item one", "Item two"] }
```

Event types: `user`, `assistant`, `tool`, `confidence`, `missed`, `complete`.

Register new scenarios in `src/scenarios/index.ts`.

## Stack

- Vite + React + TypeScript
- Sourcegraph-inspired dark theme (CSS tokens in `src/styles/tokens.css`)
