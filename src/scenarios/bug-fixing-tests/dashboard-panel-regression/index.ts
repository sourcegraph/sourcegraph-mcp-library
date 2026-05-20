import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const dashboardPanelRegressionPrompt: ScenarioPrompt = {
  id: "dashboard-panel-regression",
  label: "Dashboard panel upgrade regression",
  environment: "mono-repo",
  text: "Dashboard panels disappear after upgrade from 10.2 to 10.3. Fix the regression.",
  metrics: promptMetrics.bugPanelRegression,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
