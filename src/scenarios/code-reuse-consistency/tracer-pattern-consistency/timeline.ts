import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  {
    at: 400,
    type: "assistant",
    text: "I'll search pkg/ for the global `var tracer = otel.Tracer(...)` pattern and compare it to injected struct fields.",
    stream: true,
  },
  {
    at: 900,
    type: "tool",
    id: "grep-global",
    name: "bash",
    args: '{ cmd: "find ./pkg -name \\"*.go\\" | xargs grep -l \\"var tracer = otel.Tracer\\"" }',
    status: "running",
  },
  {
    at: 1600,
    type: "tool",
    id: "grep-global",
    name: "bash",
    args: '{ cmd: "find ./pkg -name \\"*.go\\" | xargs grep -l \\"var tracer = otel.Tracer\\"" }',
    status: "done",
  },
  {
    at: 2000,
    type: "tool",
    id: "grep-mixed",
    name: "bash",
    args: '{ cmd: "for f in $files; do grep -q \\".tracer.Start\\" \\"$f\\" && echo $f; done" }',
    status: "done",
  },
  {
    at: 2400,
    type: "tool",
    name: "read_file",
    args: '{ path: "pkg/bus/bus.go" }',
    status: "done",
  },
  {
    at: 2800,
    type: "tool",
    name: "read_file",
    args: '{ path: "pkg/expr/service.go" }',
    status: "done",
  },
  {
    at: 3600,
    type: "assistant",
    text: "29 files use the global pattern. No files mix global and injected tracers. Top clusters: storage/unified (11) and services/accesscontrol (7). Correct pattern in pkg/bus/bus.go and pkg/expr/service.go — inject tracing.Tracer via Wire DI.",
    stream: true,
  },
  {
    at: 5200,
    type: "assistant",
    text: "Migration tiers: (1) storage/unified + accesscontrol, (2) api + service roots, (3) peripheral packages. Step-by-step: add struct field, wire constructor param, replace tracer.Start with s.tracer.Start.",
    stream: true,
  },
  { at: 9000, type: "complete" },
];

export const withMCP: TimelineEvent[] = [
  {
    at: 400,
    type: "assistant",
    text: "I'll use Sourcegraph to find global tracer declarations under pkg/ and compare against injected struct-field patterns.",
    stream: true,
  },
  {
    at: 900,
    type: "tool",
    id: "ds-tracer",
    name: "mcp__sourcegraph__deepsearch",
    args:
      '{ question: "Find all production Go files under pkg/ using var tracer = otel.Tracer(...) and show packages with the most occurrences." }',
    status: "running",
  },
  {
    at: 2800,
    type: "tool",
    id: "ds-tracer",
    name: "mcp__sourcegraph__deepsearch",
    args:
      '{ question: "Find all production Go files under pkg/ using var tracer = otel.Tracer(...) and show packages with the most occurrences." }',
    status: "done",
  },
  {
    at: 3200,
    type: "tool",
    id: "ds-read",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "deepsearch/tracer-audit" }',
    status: "done",
  },
  {
    at: 3600,
    type: "tool",
    id: "kw-mixed",
    name: "mcp__sourcegraph__keyword_search",
    args:
      '{ query: "repo:^github.com/grafana/grafana$ file:^pkg/ \\"var tracer = otel\\" AND \\"tracer.*tracing.Tracer\\"" }',
    status: "running",
  },
  {
    at: 4200,
    type: "tool",
    id: "kw-mixed",
    name: "mcp__sourcegraph__keyword_search",
    args:
      '{ query: "repo:^github.com/grafana/grafana$ file:^pkg/ \\"var tracer = otel\\" AND \\"tracer.*tracing.Tracer\\"" }',
    status: "done",
  },
  {
    at: 4600,
    type: "tool",
    name: "mcp__sourcegraph__read_file",
    args: '{ repo: "github.com/grafana/grafana", path: "pkg/services/setting/service.go", startLine: 1, endLine: 80 }',
    status: "done",
  },
  {
    at: 5400,
    type: "assistant",
    text: "30 files use package-level globals. Heaviest: pkg/storage/unified (12) and pkg/services/accesscontrol (6). Correct injected pattern in pkg/services/cloudmigration/objectstorage/s3.go — tracer field + constructor + s3.tracer.Start().",
    stream: true,
  },
  {
    at: 6800,
    type: "assistant",
    text: "No pure mixing, but pkg/services/setting/service.go wraps otel in a settingTracer struct while still initializing at package scope — same testability problem. Prioritize storage/unified, then accesscontrol, then remaining services.",
    stream: true,
  },
  { at: 11000, type: "complete" },
];
