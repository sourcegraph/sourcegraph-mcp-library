import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 1080, costUsd: 3.80, quality: 0.18, toolCalls: 85 },
  withMCP: { timeSeconds: 330, costUsd: 1.32, quality: 0.88, toolCalls: 31 },
};

export const grpcTimeoutCrossRepoPrompt: ScenarioPrompt = {
  id: "grpc-timeout-cross-repo",
  label: "Cross-repo protocol comparison",
  environment: "multi-repo",
  repos: [
    { name: "grpc/grpc-go", url: "https://github.com/grpc/grpc-go" },
    { name: "connectrpc/connect-go", url: "https://github.com/connectrpc/connect-go" },
  ],
  text: "Trace how an RPC timeout propagates from a Go caller to the server in both grpc-go and connect-go: where does the client encode the context deadline onto the wire, how does the server parse and enforce it, and what is the key architectural difference in how the two libraries own protocol-specific timeout encoding?",
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
      definition: "Did it produce an accurate, source-verified comparison of both implementations?",
      baseline: "0.20",
      mcp: "1.0",
      notes:
        "Baseline: grpc-go side accurate from local source; connect-go side describes correct wire format (Connect-Timeout-Ms) but cannot verify SetTimeout() internals or the protocol interface abstraction — key architectural insight missed entirely. MCP: fully traced both implementations from source, identified the protocol-abstraction design difference.",
    },
    {
      dimension: "File Recall",
      weight: "30%",
      definition: "Did it identify the ground-truth files across both repos?",
      baseline: "0.20",
      mcp: "0.85",
      notes:
        "Ground truth: http2_client.go, handler_server.go, http_util.go, transport.go (grpc-go) + protocol.go, protocol_grpc.go, protocol_connect.go, handler.go (connect-go). Baseline: found 2/8 — only grpc-go transport files; connect-go was inaccessible. MCP: found 7/8; missed error.go wrapIfContextError().",
    },
    {
      dimension: "File Precision",
      weight: "20%",
      definition: "Did it avoid citing irrelevant files?",
      baseline: "0.25",
      mcp: "0.70",
      notes:
        "Baseline: the grpc-go files it did read were relevant, but multiple failed filesystem searches (GOPATH, find /, curl) added noise without contributing signal. MCP: stayed on-target; read a few extra utility files before narrowing.",
    },
    {
      dimension: "Cross-repo Coverage",
      weight: "10%",
      definition: "Did it cite verified source from both repos?",
      baseline: "0.00",
      mcp: "1.0",
      notes:
        "Baseline: connect-go source was physically unavailable — zero verified cross-repo coverage. MCP: cited exact line numbers from both github.com/grpc/grpc-go and github.com/connectrpc/connect-go.",
    },
    {
      dimension: "Composite",
      weight: "100%",
      definition: "Overall weighted reward",
      baseline: "0.18",
      mcp: "0.88",
      notes:
        "Baseline: scored on grpc-go alone; cross-repo coverage was zero. MCP: 5x improvement driven by discovering connect-go source and identifying the architectural difference that only becomes visible when reading both codebases together.",
    },
  ],
};
