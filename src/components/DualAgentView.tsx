import { Fragment, useCallback, useEffect, useState } from "react";
import type { ColumnState, Scenario, ScenarioPrompt } from "../types/scenario";
import {
  formatCost,
  formatDuration,
  formatQuality,
  savingsPercent,
  validateScenarioPromptRepo,
} from "../types/scenario";
import { AgentColumn } from "./AgentColumn";
import { DemoTabs } from "./DemoTabs";
import { PlaybackControls } from "./PlaybackControls";
import { PromptText } from "./PromptText";
import { QualityBreakdown } from "./QualityBreakdown";
import "./DualAgentView.css";

/**
 * Render a quality ratio like 5.0625 as "5" and 1.4 as "1.4" — round to one
 * decimal but drop trailing ".0" so whole-number multipliers stay terse.
 */
function formatMultiplier(ratio: number): string {
  const rounded = Math.round(ratio * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

interface DualAgentViewProps {
  scenario: Scenario | null;
  activePrompt: ScenarioPrompt | null;
  activePromptId: string | null;
  onSelectPrompt: (promptId: string) => void;
  withoutState: ColumnState;
  withState: ColumnState;
  stepIndex: number;
  stepCount: number;
  canStepBack: boolean;
  canStepForward: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
}

export function DualAgentView({
  scenario,
  activePrompt,
  activePromptId,
  onSelectPrompt,
  withoutState,
  withState,
  stepIndex,
  stepCount,
  canStepBack,
  canStepForward,
  onStepBack,
  onStepForward,
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

  const repoData = activePrompt ? validateScenarioPromptRepo(activePrompt, scenario) : null;
  const repo = repoData?.repo;
  const repoUrl = repoData?.repoUrl;
  const repos = activePrompt?.repos ?? scenario?.repos;

  const bothCompleted = withoutState.completed && withState.completed;

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
  // Quality is expressed as a multiplier (MCP / baseline) since the absolute
  // score is on a 0–1 scale where "% higher" reads poorly. Requires both
  // values present AND a non-zero baseline (otherwise the ratio is undefined).
  const qualityMultiplier =
    withoutMetrics?.quality !== undefined &&
    withMetrics?.quality !== undefined &&
    withoutMetrics.quality > 0
      ? withMetrics.quality / withoutMetrics.quality
      : 0;
  const showTimeSavings = timeSaved > 0;
  const showCostSavings = costSaved > 0;
  const showQualitySavings = qualityMultiplier > 1;
  const showSavings =
    activePrompt &&
    bothCompleted &&
    (showTimeSavings || showCostSavings || showQualitySavings);

  // Build headline + before/after detail in lockstep so dimensions stay aligned.
  const headlineParts: { key: string; node: React.ReactNode }[] = [];
  const beforeParts: string[] = [];
  const afterParts: string[] = [];
  if (showTimeSavings && withoutMetrics && withMetrics) {
    headlineParts.push({
      key: "time",
      node: <strong>{timeSaved}% faster</strong>,
    });
    beforeParts.push(formatDuration(withoutMetrics.timeSeconds!));
    afterParts.push(formatDuration(withMetrics.timeSeconds!));
  }
  if (showCostSavings && withoutMetrics && withMetrics) {
    headlineParts.push({
      key: "cost",
      node: <strong>{costSaved}% lower cost</strong>,
    });
    beforeParts.push(formatCost(withoutMetrics.costUsd!));
    afterParts.push(formatCost(withMetrics.costUsd!));
  }
  if (showQualitySavings && withoutMetrics && withMetrics) {
    headlineParts.push({
      key: "quality",
      node: <strong>{formatMultiplier(qualityMultiplier)}× higher quality</strong>,
    });
    beforeParts.push(formatQuality(withoutMetrics.quality!));
    afterParts.push(formatQuality(withMetrics.quality!));
  }

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
        <div className="dual-agent__toolbar-row">
          <PlaybackControls
            stepIndex={stepIndex}
            stepCount={stepCount}
            canStepBack={canStepBack}
            canStepForward={canStepForward}
            disabled={!activePrompt}
            onStepBack={onStepBack}
            onStepForward={onStepForward}
          />
          <div className="dual-agent__prompt">
          {scenario && activePrompt ? (
            <PromptText text={activePrompt.text} className="dual-agent__prompt-text" />
          ) : (
            <p className="dual-agent__prompt-placeholder">
              Select a use case to start the demo
            </p>
          )}
          </div>
        </div>
        {showSavings && (
          <p className="dual-agent__savings" role="status">
            With Sourcegraph MCP:{" "}
            {headlineParts.map((part, i) => (
              <Fragment key={part.key}>
                {i > 0 && " · "}
                {part.node}
              </Fragment>
            ))}
            <span className="dual-agent__savings-detail">
              {" ("}
              {beforeParts.join(" ")}
              {" → "}
              {afterParts.join(" ")}
              {")"}
            </span>
          </p>
        )}
      </div>
      <div className="dual-agent__columns">
        <AgentColumn
          title="Agent (Baseline)"
          variant="plain"
          state={{
            ...withoutState,
            completed: withoutState.completed && withState.completed,
          }}
          metrics={activePrompt?.metrics.withoutMCP ?? {}}
          repo={repo}
          repoUrl={repoUrl}
          repos={repos}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withoutMCP}
          logsFileExtension={activePrompt?.logsFileExtension}
        />
        <AgentColumn
          title="Agent + Sourcegraph MCP"
          variant="mcp"
          state={{
            ...withState,
            completed: withoutState.completed && withState.completed,
          }}
          metrics={activePrompt?.metrics.withMCP ?? {}}
          repo={repo}
          repoUrl={repoUrl}
          repos={repos}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withMCP}
          logsFileExtension={activePrompt?.logsFileExtension}
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
