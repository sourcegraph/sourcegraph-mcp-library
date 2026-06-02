import type { QualityBreakdownRow } from "../types/scenario";
import "./QualityBreakdown.css";

interface QualityBreakdownProps {
  rows: QualityBreakdownRow[];
  collapsed: boolean;
  onToggle: () => void;
}

export function QualityBreakdown({
  rows,
  collapsed,
  onToggle,
}: QualityBreakdownProps) {
  if (!rows.length) return null;
  const regionId = "quality-breakdown-region";

  return (
    <div className="quality-breakdown">
      <button
        type="button"
        className="quality-breakdown__header"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={regionId}
      >
        <span className="quality-breakdown__header-left">
          <span className="quality-breakdown__title">Quality Breakdown</span>
          <span
            className="quality-breakdown__count"
            aria-label={`${rows.length} dimensions`}
          >
            · {rows.length} {rows.length === 1 ? "dimension" : "dimensions"}
          </span>
        </span>
        <span className="quality-breakdown__chevron" aria-hidden>
          {collapsed ? "▾" : "▴"}
        </span>
      </button>
      {!collapsed && (
        <div id={regionId} className="quality-breakdown__body">
          <table className="quality-breakdown__table">
            <thead>
              <tr>
                <th scope="col" className="quality-breakdown__th-dim">
                  Dimension
                </th>
                <th scope="col" className="quality-breakdown__th-definition">
                  Weight/Definition
                </th>
                <th scope="col" className="quality-breakdown__th-value">
                  Baseline
                </th>
                <th scope="col" className="quality-breakdown__th-value">
                  MCP
                </th>
                <th scope="col" className="quality-breakdown__th-notes">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.dimension}>
                  <td className="quality-breakdown__dim">{row.dimension}</td>
                  <td className="quality-breakdown__definition">
                    {row.weight && (
                      <div className="quality-breakdown__definition-weight">
                        {row.weight}
                      </div>
                    )}
                    {row.definition}
                  </td>
                  <td className="quality-breakdown__value quality-breakdown__value--baseline">
                    {row.baseline}
                  </td>
                  <td className="quality-breakdown__value quality-breakdown__value--mcp">
                    {row.mcp}
                  </td>
                  <td className="quality-breakdown__notes">
                    {row.notes ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
