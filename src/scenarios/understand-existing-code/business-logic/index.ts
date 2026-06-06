import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 16 * 60, costUsd: 3.55 },
  withMCP: { timeSeconds: 4 * 60 + 45, costUsd: 0.95 },
};

export const businessLogicPrompt: ScenarioPrompt = {
  id: "business-logic",
  label: "Understanding business logic",
  environment: "mono-repo",
  text: "What business rules determine when an extension is blocked in Restricted Mode vs allowed in a Trusted workspace?",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
