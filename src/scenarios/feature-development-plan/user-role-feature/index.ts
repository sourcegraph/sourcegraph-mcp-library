import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const userRoleFeaturePrompt: ScenarioPrompt = {
  id: "user-role-feature",
  label: "User Role across auth & admin",
  environment: "mono-repo",
  text: "Add a Role field to the User model and wire it through auth, API, and the admin UI.",
  metrics: promptMetrics.featureUserRole,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
