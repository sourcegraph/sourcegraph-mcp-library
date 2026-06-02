import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 14 * 60, costUsd: 2.75 },
  withMCP: { timeSeconds: 5 * 60 + 20, costUsd: 0.98 },
};

export const rpcRetryConsistencyPrompt: ScenarioPrompt = {
  id: "rpc-retry-consistency",
  label: "RPC retry pattern matching",
  environment: "mono-repo",
  text: "Add a retry wrapper for RPC calls in our new streaming connector. Match existing patterns in the codebase.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
