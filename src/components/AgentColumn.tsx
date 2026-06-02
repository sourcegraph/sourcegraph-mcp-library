import { memo } from "react";
import type { ColumnState, ExecutionMetrics } from "../types/scenario";
import { buildLogFilename, downloadLog } from "../utils/downloadLog";
import { ExecutionMetricsBar } from "./ExecutionMetrics";
import { ConversationStream } from "./ConversationStream";
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
  logsFileExtension?: "log" | "json";
}

function AgentColumnImpl({
  title,
  variant,
  state,
  metrics,
  repo,
  repoUrl,
  scenarioId,
  promptId,
  logContent,
  logsFileExtension = "log",
}: AgentColumnProps) {
  const isMcp = variant === "mcp";
  const canDownloadLog = Boolean(scenarioId && promptId && logContent);

  const handleDownloadLog = () => {
    if (!scenarioId || !promptId || !logContent) return;
    downloadLog(
      buildLogFilename(scenarioId, promptId, variant, logsFileExtension),
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

      <ExecutionMetricsBar
        metrics={metrics}
        visible={state.completed}
      />

      <div className="agent-column__body">
        <ConversationStream events={state.events} />
      </div>
    </div>
  );
}

export const AgentColumn = memo(AgentColumnImpl);
