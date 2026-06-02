import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 163, costUsd: 0.26, quality: 0, toolCalls: 483 },
  withMCP: { timeSeconds: 145, costUsd: 0.28, quality: 1, toolCalls: 42 },
};

export const aclCodeAuditPrompt: ScenarioPrompt = {
  id: "acl-code-audit",
  label: "ACL authorization code audit",
  environment: "multi-repo",
  text: "Find all Java source files in apache/kafka that implement or define Access Control List (ACL) authorization logic. For each file, report the class name and whether it defines the interface, implements it, or provides utilities.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  qualityBreakdown: [
    {
      dimension: "File Recall",
      baseline: "21/25 (84%)",
      mcp: "25/25 (100%)",
      notes:
        "Baseline missed all metadata/authorizer files (StandardAuthorizer, ClusterMetadataAuthorizer, AclCache, AclMutator); MCP found them via sg_list_files.",
    },
    {
      dimension: "Directory Coverage",
      baseline: "clients/ only",
      mcp: "All 4 authorizer directories",
      notes:
        "Baseline limited to clients/src/main and core/src/main; MCP discovered metadata/, server/security/, and clients/server/authorizer/.",
    },
    {
      dimension: "Approach",
      baseline: "Filename globbing",
      mcp: "Semantic + structural search",
      notes:
        "Baseline relied on `find -name '*Authorizer*.java'`; MCP combined keyword_search, nls_search, and list_files.",
    },
    {
      dimension: "Tool Calls",
      baseline: "483",
      mcp: "42",
      notes:
        "Baseline issued many scattered bash/grep calls; MCP used targeted semantic queries.",
    },
    {
      dimension: "Output Structure",
      baseline: "Flat file list",
      mcp: "Grouped by directory area",
      notes:
        "MCP categorized results into ACL data model, Authorizer interface, server security, and KRaft authorizer package.",
    },
    {
      dimension: "Final Reward",
      baseline: "0.00 ❌",
      mcp: "1.00 ✅",
      notes: "MCP passed; baseline failed.",
    },
  ],
};
