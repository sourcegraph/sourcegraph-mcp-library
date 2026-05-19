import type { ScenarioPrompt } from "../types/scenario";
import "./PromptSelector.css";

interface PromptSelectorProps {
  prompts: ScenarioPrompt[];
  activePromptId: string | null;
  onSelect: (promptId: string) => void;
}

export function PromptSelector({
  prompts,
  activePromptId,
  onSelect,
}: PromptSelectorProps) {
  if (prompts.length <= 1) {
    return null;
  }

  return (
    <div className="prompt-selector" role="tablist" aria-label="Environment">
      {prompts.map((prompt) => (
        <button
          key={prompt.id}
          type="button"
          role="tab"
          aria-selected={activePromptId === prompt.id}
          className={`prompt-selector__tab ${activePromptId === prompt.id ? "prompt-selector__tab--active" : ""}`}
          onClick={() => onSelect(prompt.id)}
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
}
