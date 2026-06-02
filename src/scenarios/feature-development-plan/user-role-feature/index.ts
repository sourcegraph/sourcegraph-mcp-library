import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 35 * 60, costUsd: 8.4 },
  withMCP: { timeSeconds: 12 * 60 + 15, costUsd: 2.65 },
};

export const userRoleFeaturePrompt: ScenarioPrompt = {
  id: "user-role-feature",
  label: "User Role across auth & admin",
  environment: "mono-repo",
  text: "Add a Role field to the User model and wire it through auth, API, and the admin UI.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
