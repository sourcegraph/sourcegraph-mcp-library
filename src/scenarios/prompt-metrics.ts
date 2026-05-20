import type { PromptMetrics } from "../types/scenario";

/** Scripted end-to-end time & cost (without vs with Sourcegraph MCP) */
export const promptMetrics = {
  understandSettingsSync: {
    withoutMCP: { timeSeconds: 22 * 60, costUsd: 4.85 },
    withMCP: { timeSeconds: 7 * 60 + 25, costUsd: 1.52 },
  },
  understandExtensionHost: {
    withoutMCP: { timeSeconds: 18 * 60, costUsd: 3.9 },
    withMCP: { timeSeconds: 5 * 60 + 10, costUsd: 1.1 },
  },
  understandBusinessLogic: {
    withoutMCP: { timeSeconds: 16 * 60, costUsd: 3.55 },
    withMCP: { timeSeconds: 4 * 60 + 45, costUsd: 0.95 },
  },
  codeReuseRetry: {
    withoutMCP: { timeSeconds: 14 * 60, costUsd: 2.75 },
    withMCP: { timeSeconds: 5 * 60 + 20, costUsd: 0.98 },
  },
  featureUserRole: {
    withoutMCP: { timeSeconds: 35 * 60, costUsd: 8.4 },
    withMCP: { timeSeconds: 12 * 60 + 15, costUsd: 2.65 },
  },
  bugPanelRegression: {
    withoutMCP: { timeSeconds: 26 * 60, costUsd: 5.2 },
    withMCP: { timeSeconds: 9 * 60 + 40, costUsd: 1.85 },
  },
  incidentLatency: {
    withoutMCP: { timeSeconds: 45 * 60, costUsd: 6.8 },
    withMCP: { timeSeconds: 14 * 60 + 5, costUsd: 2.1 },
  },
  securityAclBypass: {
    withoutMCP: { timeSeconds: 20 * 60, costUsd: 3.45 },
    withMCP: { timeSeconds: 7 * 60 + 15, costUsd: 1.15 },
  },
  auditBillingEvents: {
    withoutMCP: { timeSeconds: 24 * 60, costUsd: 4.1 },
    withMCP: { timeSeconds: 8 * 60 + 30, costUsd: 1.38 },
  },
  aclCodeAudit: {
    withoutMCP: { timeSeconds: 163, costUsd: 0.26 },
    withMCP: { timeSeconds: 145, costUsd: 0.28 },
  },
} as const satisfies Record<string, PromptMetrics>;
