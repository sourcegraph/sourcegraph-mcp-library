import type { Scenario } from "../types/scenario";
import "./UseCasePanel.css";

interface UseCasePanelProps {
  scenarios: Scenario[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function UseCasePanel({
  scenarios,
  activeId,
  onSelect,
}: UseCasePanelProps) {
  return (
    <aside className="use-case-panel">
      <h2 className="use-case-panel__heading">Use cases</h2>
      <p className="use-case-panel__hint">
        Press <kbd>1</kbd>–<kbd>7</kbd> to switch
      </p>
      <ul className="use-case-panel__list">
        {scenarios.map((scenario, index) => (
          <li key={scenario.id}>
            <button
              type="button"
              className={`use-case-card ${activeId === scenario.id ? "use-case-card--active" : ""}`}
              onClick={() => onSelect(scenario.id)}
              aria-current={activeId === scenario.id ? "true" : undefined}
            >
              <span className="use-case-card__index">{index + 1}</span>
              <div className="use-case-card__content">
                <span className="use-case-card__title">{scenario.title}</span>
                <span className="use-case-card__subtitle">
                  {scenario.subtitle}
                </span>
                {scenario.prompts.length > 1 && (
                  <span className="use-case-card__prompt-count">
                    {scenario.prompts.length} prompts
                  </span>
                )}
                {scenario.repo && (
                  <span className="use-case-card__repo">{scenario.repo}</span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
