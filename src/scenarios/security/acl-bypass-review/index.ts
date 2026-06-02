import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 20 * 60, costUsd: 3.45 },
  withMCP: { timeSeconds: 7 * 60 + 15, costUsd: 1.15 },
};

export const aclBypassReviewPrompt: ScenarioPrompt = {
  id: "acl-bypass-review",
  label: "ACL authorization bypass risks",
  environment: "mono-repo",
  text: "Is Kafka ACL authorization bypassable for topic billing-events? Find security risks in the authorizer chain.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
