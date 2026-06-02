import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 810, costUsd: 3.06, quality: 0.16, toolCalls: 104 },
  withMCP: { timeSeconds: 348, costUsd: 1.96, quality: 0.81, toolCalls: 44 },
};

export const flinkCheckpointArchPrompt: ScenarioPrompt = {
  id: "flink-checkpoint-arch-001",
  label: "Architecture comprehension",
  environment: "mono-repo",
  repo: "apache/flink",
  repoUrl: "https://github.com/apache/flink",
  text: "Map Flink's checkpoint coordination architecture: trace how the JobManager triggers checkpoints, barriers propagate through the task graph, operators snapshot state, and the system coordinates acknowledgments back to completion.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  qualityBreakdown: [
    {
      dimension: "Task Quality",
      weight: "40%",
      definition: "Is it a well-formed architectural analysis?",
      baseline: "0.40",
      mcp: "1.0",
      notes:
        "Baseline: 975-line output appears to be verbose exploration without synthesizing into a coherent architecture narrative. MCP: produced focused analysis mapping to component responsibilities.",
    },
    {
      dimension: "File Recall",
      weight: "30%",
      definition: "Did it find the right files?",
      baseline: "0.00",
      mcp: "0.80",
      notes:
        "Baseline: explored 19 files (scattered, many irrelevant). MCP: systematically identified the 15 ground-truth files",
    },
    {
      dimension: "File Precision",
      weight: "20%",
      definition: "Did it avoid naming the wrong ones?",
      baseline: "0.00",
      mcp: "0.60",
      notes:
        "Baseline: listed nothing scorable. MCP: stayed mostly on-target but listed a few extra files, lowering this slightly.",
    },
    {
      dimension: "Dependecy Accuracy",
      weight: "10%",
      definition: "Did it trace the order of the call chain?",
      baseline: "0.00",
      mcp: "0.5",
      notes:
        "Baseline never laid out a recognizable dependency chain. MCP methodically traced the chain in roughly the correct order",
    },
    {
      dimension: "Composite",
      weight: "100%",
      definition: "Overall weighted reward",
      baseline: "0.16",
      mcp: "0.81",
      notes:
        "Baseline: information retrieval (IR) dimensions summed to zero. MCP peformed well for the IR and analysis, therefore it's score was 5x.",
    },
  ],
};
