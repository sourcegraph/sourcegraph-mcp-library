export type ToolStatus = "running" | "done";

export type TimelineEvent =
  | { at: number; type: "user"; text: string }
  | { at: number; type: "assistant"; text: string; stream?: boolean }
  | {
      at: number;
      type: "tool";
      /**
       * Optional stable identifier linking a `running` event to its later
       * `done` event. When set, the player matches transitions by `id` and
       * ignores `name`/`args` differences (so you can shorten `args` on the
       * `done` event if you want). When omitted, the player falls back to
       * matching the most recent still-running tool with identical
       * `name + args`.
       */
      id?: string;
      name: string;
      args: string;
      status?: ToolStatus;
    }
  | { at: number; type: "complete" };

export interface ExecutionMetrics {
  /** Wall-clock time to complete the task end-to-end */
  timeSeconds?: number;
  /** Estimated inference + tooling cost in USD */
  costUsd?: number;
  /** Quality / reward score, 0.0 to 1.0 */
  quality?: number;
  /** Total number of tool calls made during the run */
  toolCalls?: number;
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

/**
 * A single dimension/row in the post-run quality breakdown table.
 * Values are free-form strings so authors can mix percentages, fractions,
 * qualitative labels, and unicode indicators (✓ / ✕ / ❌ / ✅) freely.
 */
export interface QualityBreakdownRow {
  dimension: string;
  /** Optional weight of this dimension in the composite score (e.g. "0.40"). */
  weight?: string;
  /** Optional plain-language description of what this dimension measures. */
  definition?: string;
  baseline: string;
  mcp: string;
  notes?: string;
}

export interface ScenarioPrompt {
  id: string;
  /** Short label for the demo picker in the sidebar */
  label: string;
  text: string;
  /** Display-only chip; not a user-facing toggle */
  environment?: RepoEnvironment;
  repo?: string;
  repoUrl?: string;
  metrics: PromptMetrics;
  withoutMCP: TimelineEvent[];
  withMCP: TimelineEvent[];
  /** Live execution logs for download (manually added to the repo) */
  logs: ScenarioPromptLogs;
  /** File extension for downloaded logs: "log" (default) or "json" for trajectory files */
  logsFileExtension?: "log" | "json";
  /** Optional side-by-side scoring table shown below the two agent columns. */
  qualityBreakdown?: QualityBreakdownRow[];
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  repo?: string;
  repoUrl?: string;
  prompts: ScenarioPrompt[];
}

export type ConversationEvent =
  | { type: "user"; id: string; text: string }
  | { type: "assistant"; id: string; text: string; isStreaming?: boolean }
  | { type: "tool"; id: string; name: string; args: string; status: ToolStatus }
  | { type: "complete" };

export interface ColumnState {
  events: ConversationEvent[];
  completed: boolean;
}

export const emptyColumnState = (): ColumnState => ({
  events: [],
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

export function formatQuality(q: number): string {
  return q.toFixed(2);
}

export function formatToolCalls(n: number): string {
  return n.toLocaleString("en-US");
}

export function savingsPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}
