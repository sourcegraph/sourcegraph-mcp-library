import type { Scenario } from "../types/scenario";
import "./UseCasePanel.css";

interface UseCasePanelProps {
  scenarios: Scenario[];
  activeId: string | null;
  onSelectScenario: (id: string) => void;
}

export function UseCasePanel({
  scenarios,
  activeId,
  onSelectScenario,
}: UseCasePanelProps) {
  return (
    <aside className="use-case-panel">
      <h2 className="use-case-panel__heading">Use cases</h2>
      <p className="use-case-panel__hint">
        Press <kbd>1</kbd>–<kbd>7</kbd> to switch
      </p>
      <ul className="use-case-panel__list">
        {scenarios.map((scenario, index) => {
          const isActive = activeId === scenario.id;
          const demoCount = scenario.prompts.length;
          const singlePrompt = demoCount === 1 ? scenario.prompts[0] : null;

          return (
            <li key={scenario.id} className="use-case-panel__item">
              <button
                type="button"
                className={`use-case-card ${isActive ? "use-case-card--active" : ""}`}
                onClick={() => onSelectScenario(scenario.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="use-case-card__index">{index + 1}</span>
                <div className="use-case-card__content">
                  <span className="use-case-card__title">{scenario.title}</span>
                  <span className="use-case-card__subtitle">
                    {scenario.subtitle}
                  </span>
                  <div className="use-case-card__meta">
                    <span className="use-case-card__prompt-count">
                      {demoCount} {demoCount === 1 ? "demo" : "demos"}
                    </span>
                    {singlePrompt?.environment && (
                      <span className="use-case-card__chip">
                        {singlePrompt.environment}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
