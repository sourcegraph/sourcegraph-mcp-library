import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 45 * 60, costUsd: 6.8 },
  withMCP: { timeSeconds: 14 * 60 + 5, costUsd: 2.1 },
};

export const queryLatencySpikePrompt: ScenarioPrompt = {
  id: "query-latency-spike",
  label: "P99 latency spike after deploy",
  environment: "multi-repo",
  text: "P99 latency spiked on /api/ds/query after last night's deploy. Find what changed.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
