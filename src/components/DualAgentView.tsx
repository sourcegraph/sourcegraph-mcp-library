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
  const showSavings =
    activePrompt &&
    withoutState.completed &&
    withState.completed &&
    !isPlaying;

  const timeSaved = activePrompt
    ? savingsPercent(
        activePrompt.metrics.withoutMCP.timeSeconds,
        activePrompt.metrics.withMCP.timeSeconds,
      )
    : 0;
  const costSaved = activePrompt
    ? savingsPercent(
        activePrompt.metrics.withoutMCP.costUsd,
        activePrompt.metrics.withMCP.costUsd,
      )
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
            With Sourcegraph MCP: <strong>{timeSaved}% faster</strong>
            {" · "}
            <strong>{costSaved}% lower cost</strong>
            <span className="dual-agent__savings-detail">
              {" "}
              ({formatDuration(activePrompt.metrics.withoutMCP.timeSeconds)}{" "}
              {formatCost(activePrompt.metrics.withoutMCP.costUsd)} →{" "}
              {formatDuration(activePrompt.metrics.withMCP.timeSeconds)}{" "}
              {formatCost(activePrompt.metrics.withMCP.costUsd)})
            </span>
          </p>
        )}
      </div>
      <div className="dual-agent__columns">
        <AgentColumn
          title="Agent"
          variant="plain"
          state={withoutState}
          metrics={
            activePrompt?.metrics.withoutMCP ?? {
              timeSeconds: 0,
              costUsd: 0,
            }
          }
          repo={scenario?.repo}
          repoUrl={scenario?.repoUrl}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withoutMCP}
        />
        <AgentColumn
          title="Agent + Sourcegraph MCP"
          variant="mcp"
          state={withState}
          metrics={
            activePrompt?.metrics.withMCP ?? {
              timeSeconds: 0,
              costUsd: 0,
            }
          }
          repo={scenario?.repo}
          repoUrl={scenario?.repoUrl}
          scenarioId={scenario?.id}
          promptId={activePrompt?.id}
          logContent={activePrompt?.logs.withMCP}
        />
      </div>
    </section>
  );
}
