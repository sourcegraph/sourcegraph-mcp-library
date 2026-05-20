import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const crossRepoDiscoveryPrompt: ScenarioPrompt = {
  id: "cross-repo-discovery",
  label: "Cross-repo dependency / hidden repo discovery",
  environment: "multi-repo",
  text: "How does Settings Sync handle three-way merge conflicts when the same setting is changed locally and remotely?",
  metrics: promptMetrics.understandSettingsSync,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
