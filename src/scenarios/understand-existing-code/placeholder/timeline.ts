import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 800, type: "assistant", text: "I'll search the workspace for merge-related code.", stream: true },
  { at: 2200, type: "tool", name: "read_file", args: "{ path: \"src/vs/platform/settingsSync/common/settingsMerge.ts\" }", status: "running" },
  { at: 2800, type: "tool", name: "read_file", args: "{ path: \"src/vs/platform/settingsSync/common/settingsMerge.ts\" }", status: "done" },
  { at: 3600, type: "assistant", text: "Settings Sync uses `merge()` in settingsMerge.ts. When both sides change a key, it picks the newer timestamp. Conflicts surface in the sync log.", stream: true },
  { at: 7000, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 200, type: "assistant", text: "I'll search the workspace for merge-related code.", stream: true },
  { at: 600, type: "tool", name: "keyword_search", args: "{ query: \"three-way merge\" }", status: "running" },
  { at: 1200, type: "tool", name: "keyword_search", args: "{ query: \"three-way merge\" }", status: "done" },
  { at: 1600, type: "tool", name: "keyword_search", args: "{ query: \"Settings Sync merge conflicts\" }", status: "running" },
  { at: 2200, type: "tool", name: "keyword_search", args: "{ query: \"Settings Sync merge conflicts\" }", status: "done" },
  { at: 2500, type: "tool", name: "keyword_search", args: "{ query: \"added removed updated conflicts\" }", status: "running" },
  { at: 3100, type: "tool", name: "keyword_search", args: "{ query: \"added removed updated conflicts\" }", status: "done" },
  { at: 3600, type: "tool", name: "read_file", args: "{ path: \".../settingsSync/common/settingsMerge.ts\" }", status: "running" },
  { at: 4200, type: "tool", name: "read_file", args: "{ path: \".../settingsSync/common/settingsMerge.ts\" }", status: "done" },
  { at: 4500, type: "tool", name: "find_references", args: "{ symbol: \"mergeSettings\" }", status: "done" },
  { at: 5000, type: "assistant", text: "Found 31 files across 7 layers referencing Settings merge:\n\n• settingsMerge.ts — core three-way logic\n• userDataSync.ts — orchestration\n• conflictHandler.ts — UI surfacing\n• profileSyncService.ts — profile-specific path\n• syncTelemetry.ts — conflict metrics\n• +26 more across extensions & policy", stream: true },
  { at: 9500, type: "complete" },
];
