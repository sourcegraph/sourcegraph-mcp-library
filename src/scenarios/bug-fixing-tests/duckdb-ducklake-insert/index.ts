import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

// GENERATED FAITHFULLY from a harness run by `bun run export-demo` — metrics, logs,
// the quality breakdown, and timeline are all derived from the real transcript.
// Do NOT hand-edit; re-run the experiment and re-export instead.
const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 245, costUsd: 1.38, toolCalls: 39 },
  withMCP: { timeSeconds: 173, costUsd: 1.1, toolCalls: 23 },
};

export const duckdbDucklakeInsertPrompt: ScenarioPrompt = {
  id: "duckdb-ducklake-insert",
  label: "DuckLake repeated-INSERT IO error (wasm runtime)",
  environment: "multi-repo",
  repo: "duckdb/duckdb-wasm",
  text: "Using duckdb ducklake on the wasm runtime.\n\nThe first INSERT succeeds, but every INSERT after the first throws:\n\n  IO Error: Cannot write to \"<data_path>/main/events\" - it exists and is a file, not a directory! Enable OVERWRITE option to overwrite the file.\n\nFind the root cause by looking at the duckdb C bindings, the ducklake extension, and the duckdb-wasm / node runtime. Implement the fix.\n",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  // Starter rows from real run data. TODO: add qualitative dimensions
  // (file recall, directory coverage, approach, output structure).
  qualityBreakdown: [
    { dimension: "Sourcegraph usage", baseline: "0 SG calls", mcp: "13 SG calls", notes: "MCP reached for targeted semantic search; baseline relied on local tools." },
    { dimension: "Tool calls (total)", baseline: "39", mcp: "23", notes: "1.7× fewer tool calls with MCP" },
  ],
};
