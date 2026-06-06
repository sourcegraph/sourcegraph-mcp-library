import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  {
    at: 600,
    type: "assistant",
    text: "I'll explore the local adsabs repo for auth, permissions, and library code.",
    stream: true,
  },
  { at: 1800, type: "tool", name: "read_file", args: "{ path: \"adsabs/app.py\" }", status: "running" },
  { at: 2400, type: "tool", name: "read_file", args: "{ path: \"adsabs/app.py\" }", status: "done" },
  { at: 2800, type: "tool", name: "read_file", args: "{ path: \"adsabs/core/classic/user.py\" }", status: "running" },
  { at: 3400, type: "tool", name: "read_file", args: "{ path: \"adsabs/core/classic/user.py\" }", status: "done" },
  { at: 3800, type: "tool", name: "read_file", args: "{ path: \"adsabs/core/before_request_funcs.py\" }", status: "done" },
  { at: 4200, type: "tool", name: "bash", args: "{ cmd: \"grep check_permission modules/api\" }", status: "running" },
  { at: 4800, type: "tool", name: "bash", args: "{ cmd: \"grep check_permission modules/api\" }", status: "done" },
  { at: 5200, type: "tool", name: "read_file", args: "{ path: \"adsabs/modules/api/api_user.py\" }", status: "done" },
  {
    at: 6000,
    type: "assistant",
    text: "Two-tier auth: classic ADS backend + MongoDB user records. API uses developer-key capability tiers (Basic/Devel/Collab) — not request-rate limits. Libraries and saved searches live in adsgut/mongogut (MongoDB).",
    stream: true,
  },
  { at: 9000, type: "complete" },
];

export const withMCP: TimelineEvent[] = [
  {
    at: 400,
    type: "assistant",
    text: "I'll help you understand the ADS codebase architecture using Sourcegraph. Let me load the Sourcegraph tools and search for information on these key areas.",
    stream: true,
  },
  {
    at: 900,
    type: "tool",
    id: "ds-init",
    name: "mcp__sourcegraph__deepsearch",
    args:
      '{ question: "How are saved searches and user libraries managed in ADS? Where is this data stored and how is it accessed?" }',
    status: "running",
  },
  {
    at: 2000,
    type: "tool",
    id: "ds-init",
    name: "mcp__sourcegraph__deepsearch",
    args:
      '{ question: "How are saved searches and user libraries managed in ADS? Where is this data stored and how is it accessed?" }',
    status: "done",
  },
  {
    at: 2400,
    type: "tool",
    id: "ds-auth",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "https://demo.sourcegraph.com/deepsearch/1f60c951-ca39-40bc-b759-9dda6e352eb1" }',
    status: "running",
  },
  {
    at: 3800,
    type: "tool",
    id: "ds-auth",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "https://demo.sourcegraph.com/deepsearch/1f60c951-ca39-40bc-b759-9dda6e352eb1" }',
    status: "done",
  },
  {
    at: 4200,
    type: "tool",
    id: "ds-rate",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "https://demo.sourcegraph.com/deepsearch/e6992090-5d50-4f37-ad32-f9543abba2a2" }',
    status: "running",
  },
  {
    at: 5400,
    type: "tool",
    id: "ds-rate",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "https://demo.sourcegraph.com/deepsearch/e6992090-5d50-4f37-ad32-f9543abba2a2" }',
    status: "done",
  },
  {
    at: 5800,
    type: "tool",
    id: "ds-vault",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "https://demo.sourcegraph.com/deepsearch/73a33864-65a4-4985-86d8-8e9d9397f01f" }',
    status: "running",
  },
  {
    at: 7000,
    type: "tool",
    id: "ds-vault",
    name: "mcp__sourcegraph__deepsearch_read",
    args: '{ identifier: "https://demo.sourcegraph.com/deepsearch/73a33864-65a4-4985-86d8-8e9d9397f01f" }',
    status: "done",
  },
  {
    at: 7400,
    type: "tool",
    name: "mcp__sourcegraph__list_repos",
    args: '{ query: "adsabs", limit: 20 }',
    status: "done",
  },
  {
    at: 8200,
    type: "assistant",
    text: "ADS microservice map:\n\n• adsws — OAuth 2.0 provider, bootstrap tokens, flask-login sessions\n• api_gateway — flask-limiter + Redis, per-endpoint daily limits, ratelimit_multiplier by user type\n• vault — myADS saved searches & notifications (PostgreSQL)\n• biblib-service — user paper libraries with permissions (PostgreSQL)\n• nectar — iron-session frontend wrapper\n\nAnonymous users get 24h bootstrap tokens (scoped by IP); authenticated users get long-lived tokens (scoped by email:client_id).",
    stream: true,
  },
  { at: 12000, type: "complete" },
];
