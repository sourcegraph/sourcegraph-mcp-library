import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const adminAccessAuditPrompt: ScenarioPrompt = {
  id: "admin-access-audit",
  label: "ADMIN access & SOC2 compliance",
  environment: "mono-repo",
  text: "Audit who can perform ADMIN on topic billing-events. Verify all access paths are logged for SOC2 compliance.",
  metrics: promptMetrics.auditBillingEvents,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
