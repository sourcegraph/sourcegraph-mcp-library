import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "Dashboard panels disappear after upgrade from 10.2 to 10.3. Fix the regression." },
  { at: 900, type: "assistant", text: "Likely a frontend rendering bug. I'll patch the panel list component to filter null entries.", stream: true },
  { at: 2200, type: "tool", name: "read_file", args: "{ path: \"public/app/features/dashboard/.../PanelList.tsx\" }", status: "done" },
  { at: 3200, type: "assistant", text: "Added null guard in PanelList. Updated one unit test. This should stop panels from disappearing in the UI.", stream: true },
  { at: 5200, type: "missed", items: [
      "Migration 1043 — panel JSON schema change",
      "Backend store — silent drop of unknown panel types",
      "Provisioning API — breaks saved dashboards",
      "3 integration tests still failing",
      "Alert rules referencing removed panel IDs",
    ] },
  { at: 5700, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "Dashboard panels disappear after upgrade from 10.2 to 10.3. Fix the regression." },
  { at: 500, type: "tool", name: "diff_search", args: "{ query: \"panel migration 10.3\" }", status: "running" },
  { at: 1100, type: "tool", name: "diff_search", args: "{ query: \"panel migration 10.3\" }", status: "done" },
  { at: 1400, type: "tool", name: "keyword_search", args: "{ query: \"processPanels\" }", status: "done" },
  { at: 2000, type: "tool", name: "read_file", args: "{ path: \"pkg/services/dashboards/migrations/1043.go\" }", status: "done" },
  { at: 2400, type: "tool", name: "find_references", args: "{ symbol: \"normalizePanel\" }", status: "done" },
  { at: 3000, type: "assistant", text: "Root cause: migration 1043 renamed panel `type` field; backend drops unknown types. Fix: migration backfill + store compatibility shim + 4 test updates.", stream: true },
  { at: 6200, type: "missed", items: [
      "Migration 1043 — backfill added",
      "Backend store — compatibility shim",
      "Provisioning API — preserved",
      "Integration tests — all updated",
      "Alert rules — panel ID mapping fixed",
    ] },
  { at: 6700, type: "complete" },
];
