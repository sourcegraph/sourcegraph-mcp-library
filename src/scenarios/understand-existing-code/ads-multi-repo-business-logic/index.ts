import type { PromptMetrics, ScenarioPrompt } from "../../../types/scenario";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

const metrics: PromptMetrics = {
  withoutMCP: { timeSeconds: 76, costUsd: 0.1524, quality: 0.22, toolCalls: 11 },
  withMCP: { timeSeconds: 4 * 60 + 19, costUsd: 0.0943, quality: 0.93, toolCalls: 9 },
};

export const adsMultiRepoBusinessLogicPrompt: ScenarioPrompt = {
  id: "ads-multi-repo-business-logic",
  label: "Multi-repo business logic (ADS)",
  environment: "multi-repo",
  repo: "adsabs/adsws",
  repoUrl: "https://github.com/adsabs/adsws",
  text: "I just joined the ADS (NASA Astrophysics Data System) team. I need to understand how users authenticate, how anonymous vs. real users are treated differently, how API rate limiting works, and how saved searches and libraries are managed.",
  metrics,
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
  qualityBreakdown: [
    {
      dimension: "Multi-repo Coverage",
      weight: "25%",
      definition:
        "Did the answer span the microservices that implement each concern, not just one local checkout?",
      baseline: "adsabs only",
      mcp: "6 repos ✓",
      notes:
        "Baseline read only the legacy adsabs Flask app. MCP traced adsws, api_gateway, vault, biblib-service, nectar, and solr-service via Deep Search and list_repos.",
    },
    {
      dimension: "Authentication",
      weight: "20%",
      definition:
        "Accuracy of the auth mechanism, token types, and session layers described.",
      baseline: "Classic ADS + MongoDB",
      mcp: "OAuth 2.0 + sessions ✓",
      notes:
        "Baseline described a two-tier classic-ADS/MongoDB flow from the legacy monolith. MCP correctly identified flask-oauthlib in adsws, bootstrap tokens, opaque bearer tokens (not JWT), and iron-session in nectar.",
    },
    {
      dimension: "Anonymous vs Authenticated",
      weight: "20%",
      definition:
        "How well the answer distinguished anonymous and real-user treatment across auth and limits.",
      baseline: "anonymous flag + Basic tier",
      mcp: "Bootstrap + scope keys ✓",
      notes:
        "Baseline mapped anonymous to a MongoDB boolean and Basic API permissions. MCP explained 24h bootstrap tokens for anonymous users, long-lived tokens for authenticated users, IP vs email:client_id rate-limit scoping, and ratelimit_multiplier tiers.",
    },
    {
      dimension: "Rate Limiting",
      weight: "20%",
      definition:
        "Did the answer describe the actual request-rate limiting system?",
      baseline: "Capability tiers (max_rows)",
      mcp: "flask-limiter + Redis ✓",
      notes:
        "Baseline conflated query-capability permissions (Basic/Devel/Collab max_rows) with rate limiting — a different layer in the legacy app. MCP found LimiterService in api_gateway with per-endpoint daily limits, multipliers, scaling cost, and X-RateLimit-* headers.",
    },
    {
      dimension: "Saved Searches & Libraries",
      weight: "15%",
      definition:
        "Correct identification of where saved searches and paper libraries are stored and managed.",
      baseline: "adsgut / mongogut (MongoDB)",
      mcp: "vault + biblib-service ✓",
      notes:
        "Baseline pointed at adsgut in the legacy monolith. MCP identified vault for myADS notifications (queries/myads tables) and biblib-service for paper collections, including the distinction that vault's library_id is an OpenURL link-server registry.",
    },
    {
      dimension: "Composite Quality",
      weight: "100%",
      definition: "Overall accuracy for onboarding onto the current ADS architecture.",
      baseline: "0.22",
      mcp: "0.93",
      notes:
        "Baseline answered coherently for the legacy adsabs repo it had locally, but misidentified the production microservice architecture for all four prompt topics. MCP produced an accurate cross-repo map at lower cost.",
    },
  ],
};
