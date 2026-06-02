import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 24 * 60, costUsd: 4.1 },
  withMCP: { timeSeconds: 8 * 60 + 30, costUsd: 1.38 },
};

export const adminAccessAuditPrompt: ScenarioPrompt = {
  id: "admin-access-audit",
  label: "ADMIN access & SOC2 compliance",
  environment: "mono-repo",
  text: "Audit who can perform ADMIN on topic billing-events. Verify all access paths are logged for SOC2 compliance.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
