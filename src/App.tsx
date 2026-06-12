import { useCallback, useEffect, useMemo, useState } from "react";
import { DualAgentView } from "./components/DualAgentView";
import { Header } from "./components/Header";
import { UseCasePanel } from "./components/UseCasePanel";
import { useScenarioPlayer } from "./hooks/useScenarioPlayer";
import { getScenarioById, scenarios } from "./scenarios";
import { getScenarioPrompt } from "./types/scenario";
import "./App.css";

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(
    scenarios[0]?.id ?? null,
  );
  const [activePromptId, setActivePromptId] = useState<string | null>(
    scenarios[0]?.prompts[0]?.id ?? null,
  );

  const scenario = useMemo(
    () => (activeId ? getScenarioById(activeId) ?? null : null),
    [activeId],
  );

  const activePrompt = useMemo(() => {
    if (!scenario || !activePromptId) return null;
    return getScenarioPrompt(scenario, activePromptId) ?? null;
  }, [scenario, activePromptId]);

  const { withoutState, withState, replay, togglePlayPause } =
    useScenarioPlayer(activePrompt);

  const handleSelectScenario = useCallback((id: string) => {
    const next = getScenarioById(id);
    if (!next) return;

    if (id === activeId) {
      replay();
      return;
    }

    setActiveId(id);
    setActivePromptId(next.prompts[0]?.id ?? null);
  }, [activeId, replay]);

  const handleSelectPrompt = useCallback(
    (promptId: string) => {
      if (promptId === activePromptId) {
        replay();
      } else {
        setActivePromptId(promptId);
      }
    },
    [activePromptId, replay],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack browser/OS shortcuts like Cmd+1 / Ctrl+1.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
        return;
      }
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= scenarios.length) {
        const next = scenarios[num - 1];
        if (next.id === activeId) {
          replay();
        } else {
          setActiveId(next.id);
          setActivePromptId(next.prompts[0]?.id ?? null);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId, replay, togglePlayPause]);

  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <UseCasePanel
          scenarios={scenarios}
          activeId={activeId}
          onSelectScenario={handleSelectScenario}
        />
        <DualAgentView
          scenario={scenario}
          activePrompt={activePrompt}
          activePromptId={activePromptId}
          onSelectPrompt={handleSelectPrompt}
          withoutState={withoutState}
          withState={withState}
        />
      </main>
    </div>
  );
}
