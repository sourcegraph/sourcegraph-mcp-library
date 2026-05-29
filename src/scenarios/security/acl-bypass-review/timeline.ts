import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 900, type: "assistant", text: "I'll check the ACL config for billing-events.", stream: true },
  { at: 2000, type: "tool", name: "read_file", args: "{ path: \"config/acls/billing-events.json\" }", status: "done" },
  { at: 3000, type: "assistant", text: "ACL looks fine — `billing-admins` has ADMIN. No obvious bypass in the config file.", stream: true },
  { at: 5000, type: "missed", items: [
      "StandardAuthorizer — super.users implicit bypass",
      "DelegationTokenAuthorizer — token impersonation path",
      "KRaft metadata — stale ACL cache race",
      "Broker plugin order — authorizer chain misconfiguration",
      "Negative security tests — bypass cases not covered",
    ] },
  { at: 5500, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 200, type: "assistant", text: "I'll check the ACL config for billing-events.", stream: true },
  { at: 500, type: "tool", name: "keyword_search", args: "{ query: \"AuthorizerChain bypass\" }", status: "running" },
  { at: 1000, type: "tool", name: "keyword_search", args: "{ query: \"AuthorizerChain bypass\" }", status: "done" },
  { at: 1300, type: "tool", name: "go_to_definition", args: "{ symbol: \"StandardAuthorizer\" }", status: "done" },
  { at: 1900, type: "tool", name: "find_references", args: "{ symbol: \"super.users\" }", status: "done" },
  { at: 2300, type: "tool", name: "read_file", args: "{ path: \"core/.../DelegationTokenAuthorizer.scala\" }", status: "done" },
  { at: 2900, type: "assistant", text: "Security findings:\n• HIGH — super.users grants implicit ADMIN to `service-account`\n• MEDIUM — DelegationTokenAuthorizer allows impersonation if token scope too broad\n• LOW — ACL cache TTL may serve stale denies on KRaft failover\n\nRecommend: scope super.users, tighten token claims, add bypass integration tests.", stream: true },
  { at: 6000, type: "missed", items: [
      "StandardAuthorizer — super.users risk documented",
      "DelegationTokenAuthorizer — impersonation scoped",
      "KRaft metadata — cache race mitigated",
      "Broker plugin order — chain verified",
      "Negative security tests — bypass cases added",
    ] },
  { at: 6500, type: "complete" },
];
