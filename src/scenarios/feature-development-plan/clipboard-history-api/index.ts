import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 9 * 60 + 23, costUsd: 1.82 },
  withMCP: { timeSeconds: 8 * 60 + 1, costUsd: 1.21 },
};

export const clipboardHistoryApiPrompt: ScenarioPrompt = {
  id: "clipboard-history-api",
  label: "env.clipboardHistory API (partial clone)",
  environment: "mono-repo",
  text: "Help me plan a new extension API for reading system clipboard history. Show me how existing extension APIs are structured — from the API declaration in vscode.d.ts, through the main process implementation, to the IPC bridge between renderer and host — then give me a step-by-step plan for adding a new env.clipboardHistory API following the same pattern.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
