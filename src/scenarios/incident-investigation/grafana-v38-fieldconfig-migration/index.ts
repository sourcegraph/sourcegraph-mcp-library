import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 48, costUsd: 0.092, quality: 0.45, toolCalls: 8 },
  withMCP: { timeSeconds: 78, costUsd: 0.076, quality: 0.95, toolCalls: 8 },
};

const promptText = `A bug in Grafana's v38 dashboard migration silently drops table panel fieldConfig.defaults.custom during import. Find the Go source files implementing the v38 schema migration, the function handling fieldConfig merging, and the schema version constant file.`;

export const grafanaV38FieldConfigMigrationPrompt: ScenarioPrompt = {
  id: "grafana-v38-fieldconfig-migration",
  label: "V38 fieldConfig migration drop",
  environment: "mono-repo",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  text: promptText,
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  qualityBreakdown: [
    {
      dimension: "Root cause accuracy",
      weight: "30%",
      definition:
        "Whether the diagnosis identifies the actual regression vs. a plausible-but-wrong code path.",
      baseline: "Wrong path ✕",
      mcp: "Correct: guarded migrateOverrides() ✓",
      notes:
        "Baseline blamed defaults migration (lines 116–127) and cleanupFieldConfigDefaults(). MCP identified the overrides path: migrateOverrides() was skipped when defaults.custom was absent - matching the upstream fix in commit 26d36ec.",
    },
    {
      dimension: "Precision",
      weight: "20%",
      definition:
        "Specificity of the failing function, line numbers, and call chain.",
      baseline: '"appears to be", "may not preserve"',
      mcp: "processPanelsV38() line 131, full call chain ✓",
      notes:
        "MCP names the exact conditional guard and traces V38 → processPanelsV38 → migrateOverrides → migrateTableDisplayModeToCellOptions. Baseline describes a region without confirming which branch regressed.",
    },
    {
      dimension: "Proposed fix",
      weight: "20%",
      definition:
        "Whether the answer includes an actionable remediation, not just file locations.",
      baseline: "None",
      mcp: "Move migrateOverrides() outside guard ✓",
      notes:
        "MCP states the concrete fix: decouple defaults migration from overrides migration so migrateOverrides(fieldConfig) always runs. Baseline stops at hypotheses - an engineer would still need to debug manually.",
    },
    {
      dimension: "Signal vs. noise",
      weight: "15%",
      definition:
        "Focus on relevant migration files vs. pulling in tangential candidates.",
      baseline: "4 files (incl. frontend_defaults.go)",
      mcp: "2 core files (v38.go, migrations.go) ✓",
      notes:
        "Baseline's grep for fieldConfig pulled in frontend_defaults.go and migrate.go cleanup logic, steering analysis toward a merging/cleanup theory. MCP stayed narrow because the index pointed at the relevant span.",
    },
    {
      dimension: "Cost efficiency",
      weight: "15%",
      definition:
        "Inference + tooling cost for the completed answer.",
      baseline: "$0.092",
      mcp: "$0.076 (−17%) ✓",
      notes:
        "MCP delivered a higher-confidence answer at lower cost despite taking 30s longer (78s vs 48s). The risk demonstrated isn't 'no answer' - it's 'plausible wrong answer,' which is more expensive downstream.",
    },
    {
      dimension: "Composite quality",
      weight: "100%",
      definition:
        "Overall usefulness for incident triage and fix validation.",
      baseline: "0.45",
      mcp: "0.95",
      notes:
        "MCP converges on one settled root cause with line-level precision and cites the actual fix. Baseline produces a confident-sounding guess that could send an engineer down the wrong path.",
    },
  ],
};
