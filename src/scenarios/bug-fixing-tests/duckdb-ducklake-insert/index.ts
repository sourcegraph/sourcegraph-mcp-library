import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

// GENERATED FAITHFULLY from a harness run by `bun run export-demo` — metrics, logs,
// and timeline are derived from the real transcript. Quality breakdown is scored
// from that transcript. Do NOT hand-edit metrics/logs/timeline; re-run export-demo.
const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 245, costUsd: 1.38, quality: 0.85, toolCalls: 39 },
  withMCP: { timeSeconds: 173, costUsd: 1.1, quality: 0.96, toolCalls: 23 },
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
  qualityBreakdown: [
    {
      dimension: "Root cause accuracy",
      weight: "30%",
      definition:
        "Whether the diagnosis identifies the actual filesystem semantics bug vs. a plausible-but-wrong layer.",
      baseline: "Correct ✓",
      mcp: "Correct ✓",
      notes:
        "Both pinpointed `runtime_node.ts` `checkFile`/`checkDirectory` using `fs.existsSync()` instead of distinguishing files from directories. Neither blamed DuckLake or the COPY operator itself.",
    },
    {
      dimension: "Causal chain precision",
      weight: "25%",
      definition:
        "Depth of the cross-repo trace from INSERT failure through DuckLake, COPY, WASM bindings, and node runtime.",
      baseline: "Full chain, grep-driven",
      mcp: "Full chain + line refs ✓",
      notes:
        "Baseline traced ducklake_insert.cpp → physical_copy_to_file.cpp → web_filesystem.cc → runtime_node.ts via local grep/read. MCP used Sourcegraph reads across all three repos and cited ducklake_insert.cpp:563–574 and physical_copy_to_file.cpp:2589–2611.",
    },
    {
      dimension: "Fix implementation",
      weight: "25%",
      definition:
        "Whether the agent shipped a correct, production-safe patch in `runtime_node.ts`.",
      baseline: "Correct, 5 edits",
      mcp: "Correct, 2 edits ✓",
      notes:
        "Both replaced `existsSync` with `statSync`-based `isFile()`/`isDirectory()` checks matching native `LocalFileSystem`. Baseline iterated through `throwIfNoEntry` and an `existsSync` guard after hitting `@types/node` version concerns; MCP landed the fix in two edits.",
    },
    {
      dimension: "Research efficiency",
      weight: "20%",
      definition:
        "Tool-call count, wall time, and cost to reach a verified fix.",
      baseline: "39 calls · 245s · $1.38",
      mcp: "23 calls · 173s · $1.10 ✓",
      notes:
        "MCP used 13 Sourcegraph calls to jump repos without scattered bash/find. Baseline relied entirely on local grep, find, and read — correct outcome, but 1.7× more tool calls and 29% longer.",
    },
    {
      dimension: "Composite quality",
      weight: "100%",
      definition:
        "Overall usefulness for reproducing, understanding, and fixing the repeated-INSERT failure.",
      baseline: "0.85",
      mcp: "0.96",
      notes:
        "Both runs delivered the right root cause and patch. MCP wins on exploration efficiency and line-level precision across three repos; baseline needed more local search and fix iteration to reach the same answer.",
    },
  ],
};
