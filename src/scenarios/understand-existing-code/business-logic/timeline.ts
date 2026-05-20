import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "What business rules determine when an extension is blocked in Restricted Mode vs allowed in a Trusted workspace?" },
  { at: 400, type: "confidence", value: 15 },
  { at: 800, type: "assistant", text: "I'll check workspaceTrustService.ts for trust checks.", stream: true },
  { at: 2100, type: "tool", name: "read_file", args: "{ path: \"src/vs/workbench/services/workspaces/common/workspaceTrust.ts\" }", status: "done" },
  { at: 2700, type: "confidence", value: 28 },
  { at: 3100, type: "assistant", text: "Trust is stored per workspace folder. Extensions with `untrustedWorkspaces` in package.json are disabled when trust is off.", stream: true },
  { at: 5400, type: "missed", items: [
      "Extension capability registry — runtime overrides package.json",
      "Startup trust prompt — delayed vs immediate paths differ",
      "Virtual workspace support — separate capability matrix",
      "Enterprise policy — can force trust on/off",
      "Extension activation events — blocked before trust resolves",
    ] },
  { at: 5900, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "What business rules determine when an extension is blocked in Restricted Mode vs allowed in a Trusted workspace?" },
  { at: 300, type: "confidence", value: 10 },
  { at: 500, type: "tool", name: "keyword_search", args: "{ query: \"untrustedWorkspaces supported\" }", status: "running" },
  { at: 1100, type: "tool", name: "keyword_search", args: "{ query: \"untrustedWorkspaces supported\" }", status: "done" },
  { at: 1400, type: "tool", name: "find_references", args: "{ symbol: \"WorkspaceTrustManagementService\" }", status: "done" },
  { at: 1700, type: "confidence", value: 48 },
  { at: 1900, type: "tool", name: "keyword_search", args: "{ query: \"extension enablement trust\" }", status: "done" },
  { at: 2300, type: "tool", name: "read_file", args: "{ path: \"src/vs/workbench/services/extensionManagement/common/extensionEnablementService.ts\" }", status: "done" },
  { at: 2700, type: "confidence", value: 72 },
  { at: 2900, type: "assistant", text: "Business rules across 4 services:\n\n• package.json `untrustedWorkspaces` — declared capability\n• WorkspaceTrustManagementService — folder trust state\n• ExtensionEnablementService — blocks activation when untrusted\n• Policy service — enterprise overrides\n\nRestricted Mode = trust off + capability check + enablement gate", stream: true },
  { at: 5200, type: "confidence", value: 92 },
  { at: 5500, type: "missed", items: [
      "Extension capability registry",
      "Startup trust prompt",
      "Virtual workspace support",
      "Enterprise policy",
      "Extension activation events",
    ] },
  { at: 5800, type: "complete" },
];
