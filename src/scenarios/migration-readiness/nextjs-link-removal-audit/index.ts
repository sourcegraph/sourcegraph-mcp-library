import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const nextjsLinkRemovalAuditPrompt: ScenarioPrompt = {
  id: "nextjs-link-removal-audit",
  label: "Next.js Link prop removal readiness",
  environment: "multi-repo",
  text: "Next.js 16 upgrade: quantify blast radius from removing `legacyBehavior`/`passHref`, compare with React Router `Link`, and identify codemod limits.",
  metrics: promptMetrics.nextjsLinkRemovalAudit,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
