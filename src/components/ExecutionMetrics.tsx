import { Fragment } from "react";
import type { ExecutionMetrics as ExecutionMetricsType } from "../types/scenario";
import {
  formatCost,
  formatDuration,
  formatQuality,
  formatToolCalls,
} from "../types/scenario";
import "./ExecutionMetrics.css";

interface ExecutionMetricsBarProps {
  metrics: ExecutionMetricsType;
  visible: boolean;
}

interface Item {
  label: string;
  value: string;
  ariaValue: string;
}

function buildItems(m: ExecutionMetricsType): Item[] {
  const items: Item[] = [];
  if (m.timeSeconds !== undefined) {
    const v = formatDuration(m.timeSeconds);
    items.push({ label: "Time", value: v, ariaValue: v });
  }
  if (m.toolCalls !== undefined) {
    const v = formatToolCalls(m.toolCalls);
    items.push({ label: "Tool calls", value: v, ariaValue: v });
  }
  if (m.costUsd !== undefined) {
    const v = formatCost(m.costUsd);
    items.push({ label: "Cost", value: v, ariaValue: v });
  }
  if (m.quality !== undefined) {
    const v = formatQuality(m.quality);
    items.push({ label: "Quality", value: v, ariaValue: v });
  }
  return items;
}

export function ExecutionMetricsBar({
  metrics,
  visible,
}: ExecutionMetricsBarProps) {
  const items = buildItems(metrics);
  if (items.length === 0) return null;

  const ariaLabel = items
    .map((i) => `${i.label} ${i.ariaValue}`)
    .join(", ");

  return (
    <div
      className={`execution-metrics ${visible ? "execution-metrics--visible" : ""}`}
      aria-label={ariaLabel}
      aria-hidden={!visible}
    >
      {items.map((item, idx) => (
        <Fragment key={item.label}>
          {idx > 0 && (
            <div className="execution-metrics__divider" aria-hidden />
          )}
          <div className="execution-metrics__item">
            <span className="execution-metrics__label">{item.label}</span>
            <span className="execution-metrics__value">{item.value}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
