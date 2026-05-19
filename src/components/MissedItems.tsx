import "./MissedItems.css";

interface MissedItemsProps {
  items: string[] | null;
  variant: "missed" | "complete";
}

export function MissedItems({ items, variant }: MissedItemsProps) {
  if (!items || items.length === 0) return null;

  const isComplete = variant === "complete";

  return (
    <div
      className={`missed ${isComplete ? "missed--complete" : "missed--gaps"}`}
    >
      <h4 className="missed__title">
        {isComplete ? "Nothing missed" : "What the agent missed"}
      </h4>
      <ul className="missed__list">
        {items.map((item) => (
          <li key={item} className="missed__item">
            <span className="missed__icon" aria-hidden>
              {isComplete ? "✓" : "✕"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
