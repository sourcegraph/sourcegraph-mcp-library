import type { Scenario } from "../types/scenario";
import { promptMetrics } from "./prompt-metrics";

export const audit: Scenario = {
  id: "audit",
  title: "Audit",
  subtitle: "Access mapping & compliance trail coverage",
  repo: "apache/kafka",
  repoUrl: "https://github.com/apache/kafka",
  prompts: [
    {
      id: "primary",
      label: "Audit who can perform ADMIN on topic billing-…",
      text: "Audit who can perform ADMIN on topic billing-events. Verify all access paths are logged for SOC2 compliance.",
      metrics: promptMetrics.auditBillingEvents,
      withoutMCP: [
    {
      at: 0,
      type: "user",
      text: "Audit who can perform ADMIN on topic billing-events. Verify all access paths are logged for SOC2 compliance.",
    },
    { at: 400, type: "confidence", value: 28 },
    {
      at: 900,
      type: "assistant",
      text: "Reading the ACL file and listing principals with ADMIN…",
      stream: true,
    },
    {
      at: 2000,
      type: "tool",
      name: "read_file",
      args: '{ path: "config/acls/billing-events.json" }',
      status: "done",
    },
    { at: 2600, type: "confidence", value: 46 },
    {
      at: 3000,
      type: "assistant",
      text: "ACL audit: `billing-admins` has ADMIN on billing-events. Config matches policy doc.",
      stream: true,
    },
    {
      at: 5000,
      type: "missed",
      items: [
        "Super users — implicit ADMIN not in ACL export",
        "Delegation tokens — acting principal not in audit report",
        "Audit log emitters — 3 code paths skip logging",
        "Cross-cluster replication — access not attributed",
        "Retention policy — audit logs below 90-day requirement",
      ],
    },
    { at: 5500, type: "complete" },
  ],
  withMCP: [
    {
      at: 0,
      type: "user",
      text: "Audit who can perform ADMIN on topic billing-events. Verify all access paths are logged for SOC2 compliance.",
    },
    { at: 300, type: "confidence", value: 16 },
    {
      at: 500,
      type: "tool",
      name: "keyword_search",
      args: '{ query: "AclAuthorizer ADMIN billing" }',
      status: "running",
    },
    {
      at: 1000,
      type: "tool",
      name: "keyword_search",
      args: '{ query: "AclAuthorizer ADMIN billing" }',
      status: "done",
    },
    {
      at: 1400,
      type: "tool",
      name: "keyword_search",
      args: '{ query: "auditLog authorize" }',
      status: "done",
    },
    { at: 1800, type: "confidence", value: 54 },
    {
      at: 2000,
      type: "tool",
      name: "find_references",
      args: '{ symbol: "Authorizer.authorize" }',
      status: "done",
    },
    {
      at: 2400,
      type: "tool",
      name: "read_file",
      args: '{ path: "core/.../Authorizer.scala" }',
      status: "done",
    },
    { at: 2800, type: "confidence", value: 76 },
    {
      at: 3000,
      type: "assistant",
      text: "Audit report — ADMIN on billing-events:\n\nPrincipals: billing-admins (ACL), service-account (super.users), token:* (delegation)\n\nLogging gaps:\n• Token impersonation logs principal, not actor\n• Metadata sync path skips audit emit\n• Replication consumer not attributed\n\nSOC2: 3 gaps require remediation before sign-off.",
      stream: true,
    },
    { at: 5800, type: "confidence", value: 97 },
    {
      at: 6200,
      type: "missed",
      items: [
        "Super users — included in audit export",
        "Delegation tokens — actor + principal logged",
        "Audit log emitters — all paths covered",
        "Cross-cluster replication — access attributed",
        "Retention policy — 90-day requirement met",
      ],
    },
    { at: 6700, type: "complete" },
  ],
    },
  ],
};
