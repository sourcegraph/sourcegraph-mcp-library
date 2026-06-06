import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 7 * 60 + 59, costUsd: 1.85 },
  withMCP: { timeSeconds: 6 * 60 + 20, costUsd: 0.93 },
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
};
