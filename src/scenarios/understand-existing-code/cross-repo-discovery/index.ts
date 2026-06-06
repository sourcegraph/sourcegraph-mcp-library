import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 22 * 60, costUsd: 4.85 },
  withMCP: { timeSeconds: 7 * 60 + 25, costUsd: 1.52 },
};

export const crossRepoDiscoveryPrompt: ScenarioPrompt = {
  id: "cross-repo-discovery",
  label: "Cross-repo dependency / hidden repo discovery",
  environment: "multi-repo",
  text: "How does Settings Sync handle three-way merge conflicts when the same setting is changed locally and remotely?",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
