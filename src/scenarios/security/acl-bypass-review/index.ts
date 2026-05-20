import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const aclBypassReviewPrompt: ScenarioPrompt = {
  id: "acl-bypass-review",
  label: "ACL authorization bypass risks",
  environment: "mono-repo",
  text: "Is Kafka ACL authorization bypassable for topic billing-events? Find security risks in the authorizer chain.",
  metrics: promptMetrics.securityAclBypass,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
