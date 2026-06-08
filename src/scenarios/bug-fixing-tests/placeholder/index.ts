import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 26 * 60, costUsd: 5.2, quality: 0.28, toolCalls: 1 },
  withMCP: { timeSeconds: 9 * 60 + 40, costUsd: 1.85, quality: 0.93, toolCalls: 4 },
};

export const placeholderPrompt: ScenarioPrompt = {
  id: "placeholder",
  label: "placeholder",
  environment: "mono-repo",
  text: "placeholder",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
