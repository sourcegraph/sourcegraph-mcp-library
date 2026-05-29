import "./MissedItems.css";

interface MissedItemsProps {
  items: string[] | null;
  variant: "missed" | "complete";
  collapsed: boolean;
  onToggle: () => void;
}

export function MissedItems({
  items,
  variant,
  collapsed,
  onToggle,
}: MissedItemsProps) {
  if (!items || items.length === 0) return null;

  const isComplete = variant === "complete";
  const label = isComplete ? "Nothing missed" : "What the agent missed";
  const count = items.length;
  const regionId = `missed-region-${isComplete ? "complete" : "gaps"}`;

  return (
    <div
      className={`missed ${isComplete ? "missed--complete" : "missed--gaps"} ${
        collapsed ? "missed--collapsed" : "missed--expanded"
      }`}
    >
      <button
        type="button"
        className="missed__header"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-controls={regionId}
      >
        <span className="missed__header-left">
          <span className="missed__icon" aria-hidden>
            {isComplete ? "✓" : "✕"}
          </span>
          <span className="missed__title">{label}</span>
          <span className="missed__count" aria-label={`${count} items`}>
            · {count}
          </span>
        </span>
        <span className="missed__chevron" aria-hidden>
          {collapsed ? "▾" : "▴"}
        </span>
      </button>
      {!collapsed && (
        <ul id={regionId} className="missed__list">
          {items.map((item) => (
            <li key={item} className="missed__item">
              <span className="missed__item-icon" aria-hidden>
                {isComplete ? "✓" : "✕"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
