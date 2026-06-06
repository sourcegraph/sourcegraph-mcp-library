import type { ColumnState, ExecutionMetrics } from "../types/scenario";
import { buildLogFilename, downloadLog } from "../utils/downloadLog";
import { ExecutionMetricsBar } from "./ExecutionMetrics";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { MessageStream } from "./MessageStream";
import { MissedItems } from "./MissedItems";
import { ToolCallCard } from "./ToolCallCard";
import "./AgentColumn.css";

interface AgentColumnProps {
  title: string;
  variant: "plain" | "mcp";
  state: ColumnState;
  metrics: ExecutionMetrics;
  repo?: string;
  repoUrl?: string;
  scenarioId?: string;
  promptId?: string;
  logContent?: string;
  showConfidence?: boolean;
}

export function AgentColumn({
  title,
  variant,
  state,
  metrics,
  repo,
  repoUrl,
  scenarioId,
  promptId,
  logContent,
  showConfidence = false,
}: AgentColumnProps) {
  const isMcp = variant === "mcp";
  const showMissed =
    state.missedItems &&
    state.missedItems.length > 0 &&
    (!isMcp || state.completed);
  const missedVariant = isMcp ? "complete" : "missed";
  const canDownloadLog = Boolean(scenarioId && promptId && logContent);

  const handleDownloadLog = () => {
    if (!scenarioId || !promptId || !logContent) return;
    downloadLog(
      buildLogFilename(scenarioId, promptId, variant),
      logContent,
    );
  };

  return (
    <div
      className={`agent-column ${isMcp ? "agent-column--mcp" : "agent-column--plain"}`}
    >
      <div className="agent-column__header">
        <div className="agent-column__title-row">
          <h3 className="agent-column__title">{title}</h3>
          {isMcp && (
            <span className="agent-column__mcp-badge">
              <span className="agent-column__sg-logo">sg</span> mcp
            </span>
          )}
          {canDownloadLog && (
            <button
              type="button"
              className="agent-column__log-download"
              onClick={handleDownloadLog}
              title="Download Claude execution log from live run"
            >
              Download log
            </button>
          )}
        </div>
        {repo && (
          <a
            className="agent-column__repo"
            href={repoUrl ?? `https://github.com/${repo}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {repo}
          </a>
        )}
      </div>

      {showConfidence && (
        <ConfidenceMeter
          value={state.confidence}
          variant={isMcp ? "mcp" : "default"}
        />
      )}

      <ExecutionMetricsBar
        metrics={metrics}
        visible={state.completed}
      />

      <div className="agent-column__body">
        {state.userMessages.length > 0 && (
          <div className="agent-column__prompt">
            <MessageStream
              userMessages={state.userMessages}
              assistantMessages={[]}
            />
          </div>
        )}
        <div className="agent-column__feed">
          <MessageStream
            userMessages={[]}
            assistantMessages={state.assistantMessages}
          />
          {state.toolCalls.map((tool) => (
            <ToolCallCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {showMissed && (
        <MissedItems items={state.missedItems} variant={missedVariant} />
      )}
    </div>
  );
}
