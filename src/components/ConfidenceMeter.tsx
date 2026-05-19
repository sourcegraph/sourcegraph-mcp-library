import "./ConfidenceMeter.css";

interface ConfidenceMeterProps {
  value: number;
  variant?: "default" | "mcp";
}

export function ConfidenceMeter({
  value,
  variant = "default",
}: ConfidenceMeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`confidence ${variant === "mcp" ? "confidence--mcp" : ""}`}>
      <div className="confidence__header">
        <span className="confidence__label">Confidence</span>
        <span className="confidence__value">{Math.round(clamped)}%</span>
      </div>
      <div className="confidence__track">
        <div
          className="confidence__fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
