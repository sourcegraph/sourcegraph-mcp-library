import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const rpcRetryConsistencyPrompt: ScenarioPrompt = {
  id: "rpc-retry-consistency",
  label: "RPC retry pattern matching",
  environment: "mono-repo",
  text: "Add a retry wrapper for RPC calls in our new streaming connector. Match existing patterns in the codebase.",
  metrics: promptMetrics.codeReuseRetry,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
