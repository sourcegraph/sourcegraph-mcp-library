import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const aclCodeAuditPrompt: ScenarioPrompt = {
  id: "acl-code-audit",
  label: "ACL authorization code audit",
  environment: "multi-repo",
  text: "Find all Java source files in apache/kafka that implement or define Access Control List (ACL) authorization logic. For each file, report the class name and whether it defines the interface, implements it, or provides utilities.",
  metrics: promptMetrics.aclCodeAudit,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
