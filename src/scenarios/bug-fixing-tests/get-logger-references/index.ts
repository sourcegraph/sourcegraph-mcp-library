import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.trajectory.json?raw";
import withMcpLog from "./with-mcp.trajectory.json?raw";
import { withoutMCP, withMCP } from "./timeline";

// Metrics, logs, and timeline are derived from the real transcripts
// (without-mcp.trajectory.json / with-mcp.trajectory.json). Quality is scored
// from those transcripts using the with-MCP run as ground truth (see breakdown).
const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 7, costUsd: 0.0874, quality: 0.09, toolCalls: 1 },
  withMCP: { timeSeconds: 35, costUsd: 0.2761, quality: 1.0, toolCalls: 3 },
};

export const getLoggerReferencesPrompt: ScenarioPrompt = {
  id: "get-logger-references",
  label: "Locate all get_logger references",
  environment: "multi-repo",
  repo: "sg-distributed-systems/payment-service",
  repoUrl: "https://github.com/sg-distributed-systems/payment-service",
  text: "A rename mismatch of method=payment_method has broken by log-based queries silently. Find all locations where get_logger is used. List the file and line of the reference.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  logsFileExtension: "json",
  qualityBreakdown: [
    {
      dimension: "Definition located",
      weight: "10%",
      definition:
        "Did the agent identify where get_logger is actually defined (not just the import line)?",
      baseline: "0.00 ❌",
      mcp: "1.00 ✅",
      notes:
        "MCP used go_to_definition to find get_logger in a different repo — core-logger src/core_logger/factory.py:12 — plus the re-exports at src/core_logger/__init__.py:7 and :11. Baseline only saw the local `from core_logger import get_logger` import string and never located the definition site.",
    },
    {
      dimension: "All locations found",
      weight: "90%",
      definition:
        "Fraction of the 50 ground-truth reference sites (10 services × lifecycle.py import + 2 calls, service.py import + 1 call) the agent reported.",
      baseline: "5/50 (10%)",
      mcp: "50/50 (100%) ✅",
      notes:
        "MCP anchored find_references at the definition and returned every import + call site across all 10 repos in the sg-distributed-systems org. Baseline's local grep only saw the payment-service checkout, so it found just its 5 references and silently missed the 45 in the other 9 services.",
    },
    {
      dimension: "Composite quality",
      weight: "100%",
      definition:
        "Weighted score: 0.10 × definition + 0.90 × location recall.",
      baseline: "0.09",
      mcp: "1.00",
      notes:
        "Baseline = 0.90 × (5/50) + 0.10 × 0 = 0.09. MCP = 0.90 × 1.0 + 0.10 × 1.0 = 1.00. MCP took longer and cost more (35s/$0.28 vs 7s/$0.09), but local grep gives a fast, confidently-wrong answer while Sourcegraph navigation gives the complete cross-repo truth.",
    },
  ],
};
