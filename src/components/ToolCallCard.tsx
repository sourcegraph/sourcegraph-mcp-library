import type { ToolCall } from "../types/scenario";
import "./ToolCallCard.css";

interface ToolCallCardProps {
  tool: ToolCall;
}

export function ToolCallCard({ tool }: ToolCallCardProps) {
  return (
    <div
      className={`tool-card ${tool.status === "running" ? "tool-card--running" : ""}`}
    >
      <div className="tool-card__header">
        <span className="tool-card__name">{tool.name}</span>
        {tool.status === "running" && (
          <span className="tool-card__status">
            <span className="tool-card__dot" />
            running
          </span>
        )}
      </div>
      <pre className="tool-card__args">{tool.args}</pre>
    </div>
  );
}
