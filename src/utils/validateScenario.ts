import type { ScenarioPrompt, TimelineEvent } from "../types/scenario";

/**
 * Dev-time sanity checks for scripted scenarios. Surfaces classes of bugs
 * we've hit before that otherwise fail silently in the UI:
 *
 * - Orphan running tool — a `tool` with `status: "running"` that has no
 *   matching later `done` event. Causes a spinner that never stops.
 * - Missing `complete` event — without it the metrics chip and quality
 *   breakdown never appear.
 * - Suspicious `at` magnitude — likely a confusion between
 *   `metrics.timeSeconds` (real run duration) and `timeline.at`
 *   (compressed playback ms). 60 s of playback per column is enough for
 *   any scenario; anything beyond is almost certainly a typo.
 *
 * Warnings are logged with `console.warn` so the demo still runs.
 */
export function validateScenario(prompt: ScenarioPrompt): void {
  validateColumn(prompt.id, "withoutMCP", prompt.withoutMCP);
  validateColumn(prompt.id, "withMCP", prompt.withMCP);
}

const SUSPICIOUS_AT_MS = 60_000;

function validateColumn(
  promptId: string,
  column: "withoutMCP" | "withMCP",
  events: TimelineEvent[],
): void {
  const prefix = `[scenario:${promptId}/${column}]`;

  // 1. Missing `complete` event.
  if (!events.some((e) => e.type === "complete")) {
    console.warn(
      `${prefix} no \`complete\` event — metrics & quality breakdown will never render.`,
    );
  }

  // 2. Orphan running tool. Match each `running` to a later `done` either
  //    by explicit `id` (preferred) or by `name + args` fallback.
  const runningTools = events.filter(
    (e): e is Extract<TimelineEvent, { type: "tool" }> =>
      e.type === "tool" && e.status === "running",
  );
  for (const running of runningTools) {
    const matchIdx = events.findIndex((e) => {
      if (e.type !== "tool" || e.status !== "done") return false;
      if (e.at <= running.at) return false;
      if (running.id && e.id) return e.id === running.id;
      return e.name === running.name && e.args === running.args;
    });
    if (matchIdx === -1) {
      const tag = running.id ?? `${running.name}(${running.args})`;
      console.warn(
        `${prefix} tool ${tag} starts at ${running.at}ms with status "running" but never transitions to "done". ` +
          `Add a matching "done" event with the same \`id\` (or identical \`name + args\`).`,
      );
    }
  }

  // 3. Suspiciously large `at` values.
  const maxAt = events.reduce((m, e) => Math.max(m, e.at), 0);
  if (maxAt > SUSPICIOUS_AT_MS) {
    console.warn(
      `${prefix} largest \`at\` is ${maxAt}ms (${(maxAt / 1000).toFixed(1)}s). ` +
        "Did you confuse `timeline.at` (compressed playback ms) with `metrics.timeSeconds` (real run duration)? " +
        "Most scenarios fit in 10–25s of playback.",
    );
  }
}
