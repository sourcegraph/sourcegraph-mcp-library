import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const queryLatencySpikePrompt: ScenarioPrompt = {
  id: "query-latency-spike",
  label: "P99 latency spike after deploy",
  environment: "multi-repo",
  text: "P99 latency spiked on /api/ds/query after last night's deploy. Find what changed.",
  metrics: promptMetrics.incidentLatency,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
