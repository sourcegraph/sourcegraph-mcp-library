import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const businessLogicPrompt: ScenarioPrompt = {
  id: "business-logic",
  label: "Understanding business logic",
  environment: "mono-repo",
  text: "What business rules determine when an extension is blocked in Restricted Mode vs allowed in a Trusted workspace?",
  metrics: promptMetrics.understandBusinessLogic,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
