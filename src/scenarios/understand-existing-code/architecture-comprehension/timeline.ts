import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 800, type: "assistant", text: "I'll look at extensionHostProcess.ts in the current workspace.", stream: true },
  { at: 2000, type: "tool", name: "read_file", args: "{ path: \"src/vs/workbench/api/node/extensionHostProcess.ts\" }", status: "done" },
  { at: 3000, type: "assistant", text: "Extension host imports RPC, file service, and telemetry from this package. Dependencies look local to workbench/api.", stream: true },
  { at: 5700, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 200, type: "assistant", text: "I'll look at extensionHostProcess.ts in the current workspace.", stream: true },
  { at: 500, type: "tool", name: "keyword_search", args: "{ query: \"extensionHostProcess\" }", status: "running" },
  { at: 1100, type: "tool", name: "keyword_search", args: "{ query: \"extensionHostProcess\" }", status: "done" },
  { at: 1400, type: "tool", name: "find_references", args: "{ symbol: \"ExtensionHostMain\" }", status: "done" },
  { at: 2000, type: "tool", name: "keyword_search", args: "{ query: \"extension host IPC channel\" }", status: "done" },
  { at: 2400, type: "tool", name: "read_file", args: "{ path: \"src/vs/platform/remote/electron-browser/remoteAgentConnection.ts\" }", status: "done" },
  { at: 3000, type: "assistant", text: "Dependency map (18 packages, 4 layers):\n\n• extensionHostProcess → RPC, files, telemetry\n• sharedProcess — IPC broker\n• remoteAgentConnection — web/remote host\n• extensionGalleryService — marketplace\n• nativeModules — platform bindings", stream: true },
  { at: 6200, type: "complete" },
];
