import type { Scenario } from "../types/scenario";
import { promptMetrics } from "./prompt-metrics";

export const incidentInvestigation: Scenario = {
  id: "incident-investigation",
  title: "Investigating an incident",
  subtitle: "Trace regressions across services",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  prompts: [
    {
      id: "primary",
      label: "P99 latency spiked on /api/ds/query after las…",
      text: "P99 latency spiked on /api/ds/query after last night's deploy. Find what changed.",
      metrics: promptMetrics.incidentLatency,
      withoutMCP: [
    { at: 0, type: "user", text: "P99 latency spiked on /api/ds/query after last night's deploy. Find what changed." },
    { at: 400, type: "confidence", value: 28 },
    { at: 900, type: "assistant", text: "Checking recent deploy logs and the query handler in this repo…", stream: true },
    { at: 2200, type: "tool", name: "read_file", args: '{ path: "pkg/api/ds/query.go" }', status: "done" },
    { at: 2800, type: "confidence", value: 42 },
    { at: 3200, type: "assistant", text: "Added a timeout bump in query.go. Recommend rolling back deploy #4821 and monitoring.", stream: true },
    { at: 5200, type: "missed", items: [
      "Datasource proxy — new connection pool default",
      "Plugin SDK bump — breaking change in batch API",
      "Cache layer — TTL regression in shared lib",
      "Feature flag — experimental query path enabled",
      "Cross-repo: loki datasource adapter change",
    ]},
    { at: 5700, type: "complete" },
  ],
  withMCP: [
    { at: 0, type: "user", text: "P99 latency spiked on /api/ds/query after last night's deploy. Find what changed." },
    { at: 300, type: "confidence", value: 14 },
    { at: 500, type: "tool", name: "diff_search", args: '{ rev: "deploy/4820..4821", path: "**/ds/**" }', status: "running" },
    { at: 1200, type: "tool", name: "diff_search", args: '{ rev: "deploy/4820..4821", path: "**/ds/**" }', status: "done" },
    { at: 1500, type: "tool", name: "keyword_search", args: '{ query: "QueryData batch" }', status: "done" },
    { at: 1900, type: "confidence", value: 48 },
    { at: 2100, type: "tool", name: "read_file", args: '{ path: "pkg/services/query/cache.go" }', status: "done" },
    { at: 2500, type: "tool", name: "commit_search", args: '{ message: "plugin-sdk" }', status: "done" },
    { at: 2900, type: "confidence", value: 72 },
    { at: 3100, type: "assistant", text: "Incident timeline:\n• 22:14 — plugin-sdk 2.1.0 bumped (batch API signature)\n• 22:31 — cache TTL 5m → 30s in shared query path\n• 23:02 — feature flag `query.experimental` enabled for 12%\n\nPrimary: cache TTL regression. Secondary: SDK adapter not updated in loki plugin.", stream: true },
    { at: 6000, type: "confidence", value: 96 },
    { at: 6400, type: "missed", items: [
      "Datasource proxy — pool change identified",
      "Plugin SDK — adapter fix scoped",
      "Cache layer — TTL restored",
      "Feature flag — rollout halted",
      "Loki adapter — cross-repo PR linked",
    ]},
    { at: 6900, type: "complete" },
  ],
    },
  ],
};
