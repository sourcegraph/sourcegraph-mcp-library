import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 7 * 60 + 59, costUsd: 1.85, quality: 0.59, toolCalls: 110 },
  withMCP: { timeSeconds: 6 * 60 + 20, costUsd: 0.93, quality: 0.92, toolCalls: 12 },
};

export const fastapiRateLimitingPrompt: ScenarioPrompt = {
  id: "fastapi-rate-limiting",
  label: "Built-in RateLimiter dependency",
  environment: "mono-repo",
  repo: "tiangolo/fastapi",
  repoUrl: "https://github.com/tiangolo/fastapi",
  text: "Help me plan a new built-in rate limiting feature. I want to understand how FastAPI's dependency injection system works, how middleware and route-level dependencies interact, and how request metadata like client IP is accessible. Based on that, design a RateLimiter dependency class I can attach to any route.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  qualityBreakdown: [
    {
      dimension: "Middleware vs Dependency",
      weight: "25%",
      definition:
        "Did the plan explain how middleware and route-level dependencies interact, and justify the design choice?",
      baseline: "Partial",
      mcp: "Complete ✓",
      notes:
        "Baseline only noted that dependencies run after middleware. MCP produced a full comparison table - granularity, exception handling via ExceptionMiddleware, DI composability - directly answering the prompt.",
    },
    {
      dimension: "Client IP / Request Metadata",
      weight: "20%",
      definition:
        "How accurately does the plan handle real-world client identification?",
      baseline: "request.client.host only",
      mcp: "X-Forwarded-For + IP:path ✓",
      notes:
        "Baseline missed reverse-proxy deployments: default key is request.client.host with an \"unknown\" fallback. MCP reads X-Forwarded-For and scopes limits per route path (ip:path).",
    },
    {
      dimension: "DI Internals",
      weight: "20%",
      definition:
        "Depth of understanding of FastAPI's dependency injection system.",
      baseline: "Conceptual",
      mcp: "Line-level ✓",
      notes:
        "Both plans cover Request/Response injection and the security-class __call__ pattern. Baseline uniquely caught Depends(use_cache=False) - critical for counters. MCP cited solve_dependencies() at utils.py:715-716 and argued event-loop atomicity removes the need for asyncio.Lock.",
    },
    {
      dimension: "RateLimiter Design",
      weight: "25%",
      definition:
        "Is the proposed RateLimiter class complete and production-ready?",
      baseline: "Fixed window + headers",
      mcp: "Sliding window + patterns",
      notes:
        "Baseline delivered a full code sketch with X-RateLimit-Limit/Remaining/Reset headers and a use_cache=False test. MCP chose sliding window with Retry-After, documented app/router/route attachment patterns, but omitted success-path rate-limit headers and the use_cache=False requirement.",
    },
    {
      dimension: "Research Approach",
      weight: "10%",
      definition: "Efficiency of codebase exploration before planning.",
      baseline: "3 subagents, 104 tool uses",
      mcp: "2 Deep Search + 2 reads",
      notes:
        "Baseline launched three parallel explore agents (26 + 63 + 15 tool uses) after scattered local grep/read. MCP used two semantic Deep Search queries and two targeted read_file calls on canonical upstream files.",
    },
    {
      dimension: "Composite Quality",
      weight: "100%",
      definition: "Overall plan quality for implementing the feature.",
      baseline: "0.59",
      mcp: "0.92",
      notes:
        "Baseline produced an implementable plan but missed the middleware-vs-dependency analysis and production IP handling the prompt asked for. MCP answered all three prompt pillars with less exploration cost.",
    },
  ],
};
