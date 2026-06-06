import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const clipboardHistoryApiPrompt: ScenarioPrompt = {
  id: "clipboard-history-api",
  label: "env.clipboardHistory API (partial clone)",
  environment: "mono-repo",
  text: "Help me plan a new extension API for reading system clipboard history. Show me how existing extension APIs are structured — from the API declaration in vscode.d.ts, through the main process implementation, to the IPC bridge between renderer and host — then give me a step-by-step plan for adding a new env.clipboardHistory API following the same pattern.",
  metrics: promptMetrics.featureClipboardHistory,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
