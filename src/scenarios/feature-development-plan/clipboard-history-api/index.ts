import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 9 * 60 + 23, costUsd: 1.82, quality: 0.38, toolCalls: 144 },
  withMCP: { timeSeconds: 8 * 60 + 1, costUsd: 1.81, quality: 0.94, toolCalls: 50 },
};

export const clipboardHistoryApiPrompt: ScenarioPrompt = {
  id: "clipboard-history-api",
  label: "Clipboard history extension API",
  environment: "mono-repo",
  text: "Help me plan a new extension API for reading system clipboard history. Show me how existing extension APIs are structured — from the API declaration in vscode.d.ts, through the main process implementation, to the IPC bridge between renderer and host — then give me a step-by-step plan for adding a new env.clipboardHistory API following the same pattern.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  qualityBreakdown: [
    {
      dimension: "Partial Clone Response",
      weight: "20%",
      definition:
        "Both runs had extensions/ only — no src/ core. How did each run compensate?",
      baseline: "Inferred from fixture",
      mcp: "Read upstream via MCP ✓",
      notes:
        "Same constraint: local checkout is a partial clone. Baseline reverse-engineered the pattern from a single test fixture (extHost.api.impl.ts). MCP pulled real microsoft/vscode core files from Sourcegraph's index.",
    },
    {
      dimension: "Write Path Discovery",
      weight: "25%",
      definition:
        "Did the plan find the real cross-process clipboard write chain and hook points?",
      baseline: "Interface signatures only",
      mcp: "Full write chain + events ✓",
      notes:
        "MCP traced writeText → MainThreadClipboard.$writeText → IClipboardService.writeText and designed history capture around a new onDidWriteText event in BrowserClipboardService and NativeClipboardService. Baseline never identified the platform implementation files or the write path.",
    },
    {
      dimension: "Platform Files Found",
      weight: "15%",
      definition:
        "Did exploration locate the concrete IClipboardService implementations?",
      baseline: "0 platform impls",
      mcp: "3 core files ✓",
      notes:
        "MCP surfaced mainThreadClipboard.ts, electron-browser/clipboardService.ts (NativeClipboardService), and browser/clipboardService.ts. Local search never located these — only the Copilot extension fixture.",
    },
    {
      dimension: "Feature Scope Accuracy",
      weight: "20%",
      definition:
        "Did the plan correctly bound what the API can and cannot do?",
      baseline: "Assumed OS history",
      mcp: "VS Code writes only ✓",
      notes:
        "Baseline assumed VS Code can read OS-level system clipboard history and wrote a verification step to enable macOS \"Use clipboard history\" in System Settings. MCP correctly states history tracks VS Code-originated writes only — not native OS clipboard changes from other apps.",
    },
    {
      dimension: "Implementation Mechanism",
      weight: "15%",
      definition:
        "Working design vs. speculative platform API call.",
      baseline: "readHistory?() + fallback",
      mcp: "Ring buffer + onDidWriteText ✓",
      notes:
        "MCP designed a concrete 50-entry ring buffer in MainThreadClipboard fed by onDidWriteText. Baseline hinges on IClipboardService.readHistory?() it hopes the platform provides, with a single-item fallback when it doesn't — a tell it's guessing at an API it never confirmed exists.",
    },
    {
      dimension: "Research Approach",
      weight: "5%",
      definition: "Efficiency of exploration under the partial-clone constraint.",
      baseline: "2 subagents, 136 tool uses",
      mcp: "Deep Search + 3 reads",
      notes:
        "Baseline launched two explore agents (66 + 70 tool uses) across extensions/ but never reached src/. MCP used two Deep Search queries and three targeted read_file calls on canonical upstream files.",
    },
    {
      dimension: "Composite Quality",
      weight: "100%",
      definition: "Overall plan correctness for implementing the feature.",
      baseline: "0.38",
      mcp: "0.94",
      notes:
        "Baseline wrote a plausible-looking plan anchored to one fixture and a clipboard-history capability that likely doesn't exist. MCP grounded the plan in real upstream source and got both the mechanism and its limitations right.",
    },
  ],
};
