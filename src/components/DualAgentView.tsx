import { useCallback, useEffect, useState } from "react";
import type { ColumnState, Scenario, ScenarioPrompt } from "../types/scenario";
import {
  formatCost,
  formatDuration,
  savingsPercent,
} from "../types/scenario";
import { AgentColumn } from "./AgentColumn";
import { DemoTabs } from "./DemoTabs";
import "./DualAgentView.css";

interface DualAgentViewProps {
  scenario: Scenario | null;
  activePrompt: ScenarioPrompt | null;
  activePromptId: string | null;
  onSelectPrompt: (promptId: string) => void;
  withoutState: ColumnState;
  withState: ColumnState;
  isPlaying: boolean;
}

export function DualAgentView({
  scenario,
  activePrompt,
  activePromptId,
  onSelectPrompt,
  withoutState,
  withState,
  isPlaying,
}: DualAgentViewProps) {
  // Synced collapse state for the "missed items" panels in both columns.
  // Defaults to collapsed; resets to collapsed whenever the active prompt changes.
  const [missedCollapsed, setMissedCollapsed] = useState(true);
  useEffect(() => {
    setMissedCollapsed(true);
  }, [activePromptId]);
  const handleToggleMissed = useCallback(() => {
    setMissedCollapsed((c) => !c);
  }, []);

  const withoutMetrics = activePrompt?.metrics.withoutMCP;
  const withMetrics = activePrompt?.metrics.withMCP;

  const hasTime =
    withoutMetrics?.timeSeconds !== undefined &&
    withMetrics?.timeSeconds !== undefined;
  const hasCost =
    withoutMetrics?.costUsd !== undefined &&
    withMetrics?.costUsd !== undefined;

  const showSavings =
    activePrompt &&
    withoutState.completed &&
    withState.completed &&
    !isPlaying &&
    (hasTime || hasCost);

  const timeSaved =
    hasTime && withoutMetrics && withMetrics
      ? savingsPercent(
          withoutMetrics.timeSeconds!,
          withMetrics.timeSeconds!,
        )
      : 0;
  const costSaved =
    hasCost && withoutMetrics && withMetrics
      ? savingsPercent(withoutMetrics.costUsd!, withMetrics.costUsd!)
      : 0;

  return (
    <section className="dual-agent">
      {scenario && scenario.prompts.length > 1 && (
        <DemoTabs
          prompts={scenario.prompts}
          activePromptId={activePromptId}
          onSelectPrompt={onSelectPrompt}
        />
      )}
      <div className="dual-agent__toolbar">
        <div className="dual-agent__prompt">
          {scenario && activePrompt ? (
            <p className="dual-agent__prompt-text">{activePrompt.text}</p>
          ) : (
            <p className="dual-agent__prompt-placeholder">
              Select a use case to start the demo
            </p>
          )}
        </div>
        {showSavings && activePrompt && (
          <p className="dual-agent__savings" role="status">
            With Sourcegraph MCP:{" "}
            {hasTime && <strong>{timeSaved}% faster</strong>}
            {hasTime && hasCost && " · "}
            {hasCost && <strong>{costSaved}% lower cost</strong>}
            <span className="dual-agent__savings-detail">
              {" "}
              (
              {hasTime &&
                `${formatDuration(withoutMetrics!.timeSeconds!)} `}
              {hasCost && formatCost(withoutMetrics!.costUsd!)}
              {" → "}
              {hasTime && `${formatDuration(withMetrics!.timeSeconds!)} `}
              {hasCost && formatCost(withMetrics!.costUsd!)})
            </span>
          </p>
        )}
      </div>
      <div className="dual-agent__columns">
        <AgentColumn
          title="Agent"
          variant="plain"
          state={withoutState}
          metrics={activePrompt?.metrics.withoutMCP ?? {}}
          repo={scenario?.repo}
          repoUrl={scenario?.repoUrl}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withoutMCP}
          missedCollapsed={missedCollapsed}
          onToggleMissed={handleToggleMissed}
        />
        <AgentColumn
          title="Agent + Sourcegraph MCP"
          variant="mcp"
          state={withState}
          metrics={activePrompt?.metrics.withMCP ?? {}}
          repo={scenario?.repo}
          repoUrl={scenario?.repoUrl}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withMCP}
          missedCollapsed={missedCollapsed}
          onToggleMissed={handleToggleMissed}
        />
      </div>
    </section>
  );
}
