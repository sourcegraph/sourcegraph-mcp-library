export type ToolStatus = "running" | "done";

export type TimelineEvent =
  | { at: number; type: "user"; text: string }
  | { at: number; type: "assistant"; text: string; stream?: boolean }
  | {
      at: number;
      type: "tool";
      name: string;
      args: string;
      status?: ToolStatus;
    }
  | { at: number; type: "missed"; items: string[] }
  | { at: number; type: "complete" };

export interface ExecutionMetrics {
  /** Wall-clock time to complete the task end-to-end */
  timeSeconds: number;
  /** Estimated inference + tooling cost in USD */
  costUsd: number;
}

export interface PromptMetrics {
  withoutMCP: ExecutionMetrics;
  withMCP: ExecutionMetrics;
}

export type RepoEnvironment = "multi-repo" | "mono-repo";

export interface ScenarioPromptLogs {
  /** Raw claude.log text bundled from src/scenarios/.../without-mcp.claude.log */
  withoutMCP: string;
  /** Raw claude.log text bundled from src/scenarios/.../with-mcp.claude.log */
  withMCP: string;
}

export interface ScenarioPrompt {
  id: string;
  /** Short label for the demo picker in the sidebar */
  label: string;
  text: string;
  /** Display-only chip; not a user-facing toggle */
  environment?: RepoEnvironment;
  metrics: PromptMetrics;
  withoutMCP: TimelineEvent[];
  withMCP: TimelineEvent[];
  /** Live execution logs for download (manually added to the repo) */
  logs: ScenarioPromptLogs;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  repo?: string;
  repoUrl?: string;
  prompts: ScenarioPrompt[];
}

export interface UserMessage {
  id: string;
  text: string;
}

export interface AssistantMessage {
  id: string;
  text: string;
  isStreaming?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  args: string;
  status: ToolStatus;
}

export interface ColumnState {
  userMessages: UserMessage[];
  assistantMessages: AssistantMessage[];
  toolCalls: ToolCall[];
  missedItems: string[] | null;
  completed: boolean;
}

export const emptyColumnState = (): ColumnState => ({
  userMessages: [],
  assistantMessages: [],
  toolCalls: [],
  missedItems: null,
  completed: false,
});

export function getScenarioPrompt(
  scenario: Scenario,
  promptId: string,
): ScenarioPrompt | undefined {
  return scenario.prompts.find((p) => p.id === promptId);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (remainder === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainder}s`;
}

export function formatCost(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

export function savingsPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}
