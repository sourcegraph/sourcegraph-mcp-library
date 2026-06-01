import { useCallback, useEffect, useState } from "react";
import type { ColumnState, Scenario, ScenarioPrompt } from "../types/scenario";
import {
  formatCost,
  formatDuration,
  savingsPercent,
} from "../types/scenario";
import { AgentColumn } from "./AgentColumn";
import { DemoTabs } from "./DemoTabs";
import { QualityBreakdown } from "./QualityBreakdown";
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
  // Synced collapse state for the Quality Breakdown panel below the columns.
  // Defaults to collapsed; resets to collapsed whenever the active prompt changes.
  const [breakdownCollapsed, setBreakdownCollapsed] = useState(true);
  useEffect(() => {
    setBreakdownCollapsed(true);
  }, [activePromptId]);
  const handleToggleBreakdown = useCallback(() => {
    setBreakdownCollapsed((c) => !c);
  }, []);

  const withoutMetrics = activePrompt?.metrics.withoutMCP;
  const withMetrics = activePrompt?.metrics.withMCP;

  const bothCompleted =
    withoutState.completed && withState.completed && !isPlaying;

  // Only surface a "savings" call-out when MCP actually improved the metric.
  // Negative savings (MCP slower or more expensive) would read as "-8% lower
  // cost", which is contradictory, so we omit that dimension instead.
  const timeSaved =
    withoutMetrics?.timeSeconds !== undefined &&
    withMetrics?.timeSeconds !== undefined
      ? savingsPercent(withoutMetrics.timeSeconds, withMetrics.timeSeconds)
      : 0;
  const costSaved =
    withoutMetrics?.costUsd !== undefined &&
    withMetrics?.costUsd !== undefined
      ? savingsPercent(withoutMetrics.costUsd, withMetrics.costUsd)
      : 0;
  const showTimeSavings = timeSaved > 0;
  const showCostSavings = costSaved > 0;
  const showSavings =
    activePrompt && bothCompleted && (showTimeSavings || showCostSavings);

  const breakdown = activePrompt?.qualityBreakdown;
  const showBreakdown =
    bothCompleted && breakdown && breakdown.length > 0;

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
        {showSavings && withoutMetrics && withMetrics && (
          <p className="dual-agent__savings" role="status">
            With Sourcegraph MCP:{" "}
            {showTimeSavings && <strong>{timeSaved}% faster</strong>}
            {showTimeSavings && showCostSavings && " · "}
            {showCostSavings && <strong>{costSaved}% lower cost</strong>}
            <span className="dual-agent__savings-detail">
              {" ("}
              {showTimeSavings &&
                `${formatDuration(withoutMetrics.timeSeconds!)}${showCostSavings ? " " : ""}`}
              {showCostSavings && formatCost(withoutMetrics.costUsd!)}
              {" → "}
              {showTimeSavings &&
                `${formatDuration(withMetrics.timeSeconds!)}${showCostSavings ? " " : ""}`}
              {showCostSavings && formatCost(withMetrics.costUsd!)}
              {")"}
            </span>
          </p>
        )}
      </div>
      <div className="dual-agent__columns">
        <AgentColumn
          title="Agent"
          variant="plain"
          state={{
            ...withoutState,
            completed: withoutState.completed && withState.completed,
          }}
          metrics={activePrompt?.metrics.withoutMCP ?? {}}
          repo={scenario?.repo}
          repoUrl={scenario?.repoUrl}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withoutMCP}
        />
        <AgentColumn
          title="Agent + Sourcegraph MCP"
          variant="mcp"
          state={{
            ...withState,
            completed: withoutState.completed && withState.completed,
          }}
          metrics={activePrompt?.metrics.withMCP ?? {}}
          repo={scenario?.repo}
          repoUrl={scenario?.repoUrl}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withMCP}
        />
      </div>
      {showBreakdown && breakdown && (
        <QualityBreakdown
          rows={breakdown}
          collapsed={breakdownCollapsed}
          onToggle={handleToggleBreakdown}
        />
      )}
    </section>
  );
}
