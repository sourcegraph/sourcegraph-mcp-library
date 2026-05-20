import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "Add a retry wrapper for RPC calls in our new streaming connector. Match existing patterns in the codebase." },
  { at: 400, type: "confidence", value: 25 },
  { at: 900, type: "assistant", text: "I'll implement a simple retry loop with exponential backoff in the connector package.", stream: true },
  { at: 2500, type: "tool", name: "read_file", args: "{ path: \"flink-connectors/.../RpcClient.java\" }", status: "done" },
  { at: 3000, type: "confidence", value: 40 },
  { at: 3500, type: "assistant", text: "Done. Added `RetryingRpcClient` with 3 attempts and 100ms base delay in the connector module.", stream: true },
  { at: 5500, type: "missed", items: [
      "Canonical RetryStrategy in flink-rpc — different backoff policy",
      "Deprecated Guava Retries still used in 12 jobs",
      "Metrics hooks — no retry counters aligned with Flink conventions",
      "Checkstyle rule — maxAttempts must come from config",
      "Integration tests in flink-tests — pattern mismatch",
    ] },
  { at: 6000, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "Add a retry wrapper for RPC calls in our new streaming connector. Match existing patterns in the codebase." },
  { at: 300, type: "confidence", value: 18 },
  { at: 600, type: "tool", name: "keyword_search", args: "{ query: \"RetryStrategy RPC\" }", status: "running" },
  { at: 1100, type: "tool", name: "keyword_search", args: "{ query: \"RetryStrategy RPC\" }", status: "done" },
  { at: 1400, type: "tool", name: "keyword_search", args: "{ query: \"@Deprecated retry\" }", status: "done" },
  { at: 1800, type: "confidence", value: 55 },
  { at: 2000, type: "tool", name: "read_file", args: "{ path: \"flink-rpc/.../RetryStrategy.java\" }", status: "done" },
  { at: 2400, type: "tool", name: "find_references", args: "{ symbol: \"RetryStrategy\" }", status: "done" },
  { at: 2800, type: "confidence", value: 72 },
  { at: 3000, type: "assistant", text: "Canonical pattern is `RetryStrategy` in flink-rpc (config-driven backoff, metric tags). 12 call sites still use deprecated Guava Retries — I'll use the modern API and flag migrations.", stream: true },
  { at: 5500, type: "confidence", value: 92 },
  { at: 6000, type: "missed", items: [
      "Canonical RetryStrategy in flink-rpc",
      "Deprecated Guava Retries migration noted",
      "Metrics hooks aligned with conventions",
      "Checkstyle-compliant config",
      "Integration test pattern matched",
    ] },
  { at: 6500, type: "complete" },
];
