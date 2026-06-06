import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 109, costUsd: 0.12, quality: 0.78, toolCalls: 9 },
  withMCP: { timeSeconds: 82, costUsd: 0.65, quality: 0.84, toolCalls: 6 },
};

const promptText = `In the Grafana backend, the preferred pattern for tracing is to inject a tracer via the struct (e.g. s.tracer.Start(ctx, "...")), which makes services testable and tracers swappable. However, many files bypass this and declare a package-level global tracer using var tracer = otel.Tracer(...) instead.

1) Find all production Go files under pkg/ that use the global var tracer = otel.Tracer(...) pattern
2) Show an example of the correct injected pattern being used in a service. Are there any files that mix both — using an injected tracer in some methods but falling back to the global in others?
3) Which packages have the most global tracer usages and should be prioritized for migration?`;

export const tracerPatternConsistencyPrompt: ScenarioPrompt = {
  id: "tracer-pattern-consistency",
  label: "Tracer injection consistency",
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
      dimension: "Global Tracer Inventory",
      weight: "25%",
      definition:
        "Complete, accurate count and listing of production pkg/ files with package-level tracer globals.",
      baseline: "29 files ✓ (full list)",
      mcp: "30 files (no full list)",
      notes:
        "MCP found pkg/services/setting/service.go — a wrapped global (`var tracer tracing.Tracer = &settingTracer{otel.Tracer(...)}`) that baseline grep for `var tracer = otel.Tracer` missed. Baseline printed all 29 paths; MCP grouped by package only.",
    },
    {
      dimension: "Injected Pattern Example",
      weight: "20%",
      definition:
        "Quality of the cited canonical service using struct-field injection and Wire DI.",
      baseline: "bus.go + expr/service.go ✓",
      mcp: "cloudmigration/s3.go ✓",
      notes:
        "Both valid. Baseline cited core infra (InProcBus) and expr Service with ProvideService. MCP cited S3 with constructor injection and a full s3.tracer.Start() call site — slightly better as an end-to-end service example.",
    },
    {
      dimension: "Mixed Pattern Detection",
      weight: "20%",
      definition:
        "Whether files combine global and injected tracers, including subtle variants.",
      baseline: "0 mixed (grep-only)",
      mcp: "0 mixed + 1 variant ✓",
      notes:
        "Both correctly ruled out pure mixing. MCP alone surfaced setting/service.go: implements tracing.Tracer but still initializes at package scope — a migration edge case baseline's struct-field grep would not catch.",
    },
    {
      dimension: "Migration Prioritization",
      weight: "20%",
      definition:
        "Actionable ranking of packages by global-tracer density and impact.",
      baseline: "Tier 1–3 + steps ✓",
      mcp: "Priority table ✓",
      notes:
        "Counts differ by one file (unified 11 vs 12, accesscontrol 7 vs 6). Baseline added a concrete before/after migration snippet and per-file checklist; MCP added reasoning columns but no copy-paste migration template.",
    },
    {
      dimension: "Output Clarity",
      weight: "15%",
      definition:
        "Readability and coherence of the final deliverable.",
      baseline: "Garbled mid-stream",
      mcp: "Truncated / repeated",
      notes:
        "Baseline had corrupted text around the summary table (lines 50–104 in log). MCP duplicated the setting/service.go investigation and cut off mid-example before recovering. Neither run was presentation-clean.",
    },
    {
      dimension: "Composite Quality",
      weight: "100%",
      definition:
        "Overall usefulness for a consistency audit and migration planning.",
      baseline: "0.78",
      mcp: "0.84",
      notes:
        "MCP wins on completeness (+1 file, variant nuance, stronger service example) at 5.4× cost. Baseline wins on actionability (full file list, migration recipe) and is sufficient when the repo is already checked out locally.",
    },
  ],
};
