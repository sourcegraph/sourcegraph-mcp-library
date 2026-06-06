import type { TimelineEvent } from "../../../types/scenario";

const prompt =
  "Help me plan a new built-in rate limiting feature. I want to understand how FastAPI's dependency injection system works, how middleware and route-level dependencies interact, and how request metadata like client IP is accessible. Based on that, design a RateLimiter dependency class I can attach to any route.";

export const withoutMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: prompt },
  {
    at: 400,
    type: "assistant",
    text: "I'll check project memory, then explore the codebase locally — dependencies, middleware examples, and how request metadata is exposed.",
    stream: true,
  },
  {
    at: 900,
    type: "tool",
    name: "Grep",
    args: '{ pattern: "Depends|Request", glob: "fastapi/**/*.py" }',
    status: "done",
  },
  {
    at: 1200,
    type: "tool",
    name: "Read",
    args: '{ file: "fastapi/dependencies/utils.py" }',
    status: "done",
  },
  {
    at: 1500,
    type: "tool",
    name: "Read",
    args: '{ file: "fastapi/security/api_key.py" }',
    status: "done",
  },
  {
    at: 1800,
    type: "tool",
    name: "Grep",
    args: '{ pattern: "BaseHTTPMiddleware|middleware", glob: "tests/**/*.py" }',
    status: "done",
  },
  {
    at: 2100,
    type: "tool",
    name: "Read",
    args: '{ file: "tests/test_dependency_contextmanager.py" }',
    status: "done",
  },
  {
    at: 2600,
    type: "assistant",
    text: "Enough local context to enter plan mode. Launching parallel explore agents to cover DI injection, middleware/exception handling, and security-class patterns before designing RateLimiter.",
    stream: true,
  },
  {
    at: 3200,
    type: "tool",
    name: "Task",
    args: '{ subagent: "Explore FastAPI DI system and request metadata", toolUses: 26 }',
    status: "done",
  },
  {
    at: 3500,
    type: "tool",
    name: "Task",
    args: '{ subagent: "Explore middleware patterns and exception handling", toolUses: 63 }',
    status: "done",
  },
  {
    at: 3800,
    type: "tool",
    name: "Task",
    args: '{ subagent: "Explore security patterns as analog for rate limiter design", toolUses: 15 }',
    status: "done",
  },
  {
    at: 4400,
    type: "assistant",
    text: "Three explore agents finished — 104 tool uses total. Confirmed: Depends(use_cache=False) required, Request/Response injection via type annotations, security-class __call__ pattern. Design choices: fixed window, in-memory store, client IP key with custom key_func.",
    stream: true,
  },
  {
    at: 5000,
    type: "tool",
    name: "Write",
    args: '{ file_path: ".claude/plans/fastapi-ratelimit.md" }',
    status: "done",
  },
  { at: 10000, type: "complete" },
];

export const withMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: `${prompt} Use Sourcegraph Deep Search.` },
  {
    at: 400,
    type: "assistant",
    text: "I'll start with Sourcegraph Deep Search to map how FastAPI's dependency injection, middleware, and security classes work — then design the RateLimiter from canonical upstream files.",
    stream: true,
  },
  {
    at: 700,
    type: "tool",
    name: "mcp__sourcegraph__deepsearch",
    args: '{ query: "How does FastAPI dependency injection work with Request and Response injection in solve_dependencies?" }',
    status: "running",
  },
  {
    at: 2400,
    type: "tool",
    name: "mcp__sourcegraph__deepsearch",
    args: '{ query: "How does FastAPI dependency injection work with Request and Response injection in solve_dependencies?" }',
    status: "done",
  },
  {
    at: 2700,
    type: "tool",
    name: "Grep",
    args: '{ pattern: "Depends|Request", path: "docs_src" }',
    status: "done",
  },
  {
    at: 3000,
    type: "tool",
    name: "mcp__sourcegraph__deepsearch",
    args: '{ query: "How do FastAPI security classes like APIKeyHeader implement __call__ with Request injection?" }',
    status: "done",
  },
  {
    at: 3400,
    type: "assistant",
    text: "Deep Search returned the full DI and security-class architecture. Entering plan mode — one more file read to confirm exception handling before writing the plan.",
    stream: true,
  },
  {
    at: 3800,
    type: "tool",
    name: "mcp__sourcegraph__read_file",
    args: '{ repo: "github.com/tiangolo/fastapi", path: "fastapi/security/api_key.py" }',
    status: "done",
  },
  {
    at: 4100,
    type: "tool",
    name: "mcp__sourcegraph__read_file",
    args: '{ repo: "github.com/tiangolo/fastapi", path: "fastapi/dependencies/utils.py" }',
    status: "done",
  },
  {
    at: 4700,
    type: "assistant",
    text: "Dependency over middleware: HTTPException from a Depends() runs inside ExceptionMiddleware. Plan: sliding-window RateLimiter in fastapi/rate_limiting.py, IP+path default key, Retry-After on 429, export from __init__.py.",
    stream: true,
  },
  {
    at: 5200,
    type: "tool",
    name: "Write",
    args: '{ file_path: ".claude/plans/fastapi-ratelimit.md" }',
    status: "done",
  },
  { at: 8000, type: "complete" },
];
