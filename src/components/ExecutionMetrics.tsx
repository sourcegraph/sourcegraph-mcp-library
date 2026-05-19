import type { ExecutionMetrics as ExecutionMetricsType } from "../types/scenario";
import { formatCost, formatDuration } from "../types/scenario";
import "./ExecutionMetrics.css";

interface ExecutionMetricsBarProps {
  metrics: ExecutionMetricsType;
  visible: boolean;
}

export function ExecutionMetricsBar({
  metrics,
  visible,
}: ExecutionMetricsBarProps) {
  return (
    <div
      className={`execution-metrics ${visible ? "execution-metrics--visible" : ""}`}
      aria-label={`Time ${formatDuration(metrics.timeSeconds)}, cost ${formatCost(metrics.costUsd)}`}
    >
      <div className="execution-metrics__item">
        <span className="execution-metrics__label">Time</span>
        <span className="execution-metrics__value">
          {formatDuration(metrics.timeSeconds)}
        </span>
      </div>
      <div className="execution-metrics__divider" aria-hidden />
      <div className="execution-metrics__item">
        <span className="execution-metrics__label">Cost</span>
        <span className="execution-metrics__value">
          {formatCost(metrics.costUsd)}
        </span>
      </div>
    </div>
  );
}
