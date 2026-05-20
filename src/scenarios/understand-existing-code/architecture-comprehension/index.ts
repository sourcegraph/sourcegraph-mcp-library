import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const architectureComprehensionPrompt: ScenarioPrompt = {
  id: "architecture-comprehension",
  label: "Architecture comprehension",
  environment: "mono-repo",
  text: "What internal services does the VS Code extension host depend on? Map cross-package dependencies.",
  metrics: promptMetrics.understandExtensionHost,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
