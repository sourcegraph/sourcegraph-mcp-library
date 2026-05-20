import type { ScenarioPrompt } from "../types/scenario";
import "./DemoTabs.css";

interface DemoTabsProps {
  prompts: ScenarioPrompt[];
  activePromptId: string | null;
  onSelectPrompt: (promptId: string) => void;
}

export function DemoTabs({
  prompts,
  activePromptId,
  onSelectPrompt,
}: DemoTabsProps) {
  if (prompts.length <= 1) return null;

  return (
    <div
      className="demo-tabs"
      role="tablist"
      aria-label="Demo categories"
    >
      {prompts.map((prompt) => {
        const isActive = activePromptId === prompt.id;
        return (
          <button
            key={prompt.id}
            type="button"
            role="tab"
            className={`demo-tabs__tab ${isActive ? "demo-tabs__tab--active" : ""}`}
            aria-selected={isActive}
            onClick={() => onSelectPrompt(prompt.id)}
          >
            <span className="demo-tabs__label">{prompt.label}</span>
            {prompt.environment && (
              <span className="demo-tabs__chip">{prompt.environment}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
