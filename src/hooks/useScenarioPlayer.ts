import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ColumnState,
  ScenarioPrompt,
  TimelineEvent,
  ToolCall,
} from "../types/scenario";
import { emptyColumnState } from "../types/scenario";

function getMaxTime(events: TimelineEvent[]): number {
  return events.reduce((max, e) => Math.max(max, e.at), 0);
}

function applyEvent(state: ColumnState, event: TimelineEvent): ColumnState {
  const next = { ...state };

  switch (event.type) {
    case "user":
      next.userMessages = [
        ...next.userMessages,
        { id: `user-${event.at}`, text: event.text },
      ];
      break;
    case "assistant":
      next.assistantMessages = [
        ...next.assistantMessages,
        {
          id: `asst-${event.at}`,
          text: event.text,
          isStreaming: event.stream ?? false,
        },
      ];
      break;
    case "tool": {
      const existing = next.toolCalls.findIndex(
        (t) => t.name === event.name && t.args === event.args,
      );
      const tool: ToolCall = {
        id: `tool-${event.at}-${event.name}`,
        name: event.name,
        args: event.args,
        status: event.status ?? "done",
      };
      if (existing >= 0) {
        const updated = [...next.toolCalls];
        updated[existing] = tool;
        next.toolCalls = updated;
      } else {
        next.toolCalls = [...next.toolCalls, tool];
      }
      break;
    }
    case "confidence":
      next.confidence = event.value;
      break;
    case "missed":
      next.missedItems = event.items;
      break;
    case "complete":
      next.completed = true;
      next.assistantMessages = next.assistantMessages.map((m) => ({
        ...m,
        isStreaming: false,
      }));
      break;
  }

  return next;
}

function streamAssistantText(
  setState: React.Dispatch<React.SetStateAction<ColumnState>>,
  messageId: string,
  fullText: string,
  chunkMs: number,
) {
  let index = 0;
  const interval = setInterval(() => {
    index += 3;
    const partial = fullText.slice(0, index);
    setState((prev) => ({
      ...prev,
      assistantMessages: prev.assistantMessages.map((m) =>
        m.id === messageId ? { ...m, text: partial } : m,
      ),
    }));
    if (index >= fullText.length) {
      clearInterval(interval);
      setState((prev) => ({
        ...prev,
        assistantMessages: prev.assistantMessages.map((m) =>
          m.id === messageId ? { ...m, text: fullText, isStreaming: false } : m,
        ),
      }));
    }
  }, chunkMs);
  return interval;
}

export function useScenarioPlayer(prompt: ScenarioPrompt | null) {
  const [withoutState, setWithoutState] = useState<ColumnState>(
    emptyColumnState,
  );
  const [withState, setWithState] = useState<ColumnState>(emptyColumnState);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);

  const replay = useCallback(() => {
    setPlayKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!prompt) return;

    clearAll();
    setWithoutState(emptyColumnState());
    setWithState(emptyColumnState());

    const withoutMax = getMaxTime(prompt.withoutMCP);
    const withMax = getMaxTime(prompt.withMCP);
    const totalDuration = Math.max(withoutMax, withMax) + 500;
    setIsPlaying(true);

    const schedule = (
      events: TimelineEvent[],
      setState: React.Dispatch<React.SetStateAction<ColumnState>>,
    ) => {
      for (const event of events) {
        const timer = setTimeout(() => {
          if (event.type === "assistant" && event.stream) {
            const messageId = `asst-${event.at}`;
            setState((prev) =>
              applyEvent(prev, {
                ...event,
                text: "",
                stream: true,
              }),
            );
            const reducedMotion = window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;
            const interval = streamAssistantText(
              setState,
              messageId,
              event.text,
              reducedMotion ? 0 : 18,
            );
            if (reducedMotion) {
              clearInterval(interval);
              setState((prev) =>
                applyEvent(
                  {
                    ...prev,
                    assistantMessages: prev.assistantMessages.filter(
                      (m) => m.id !== messageId,
                    ),
                  },
                  event,
                ),
              );
            } else {
              intervalsRef.current.push(interval);
            }
          } else {
            setState((prev) => applyEvent(prev, event));
          }
        }, event.at);
        timersRef.current.push(timer);
      }
    };

    schedule(prompt.withoutMCP, setWithoutState);
    schedule(prompt.withMCP, setWithState);

    const endTimer = setTimeout(() => {
      setIsPlaying(false);
    }, totalDuration);
    timersRef.current.push(endTimer);

    return clearAll;
  }, [prompt, playKey, clearAll]);

  return {
    withoutState,
    withState,
    isPlaying,
    replay,
  };
}
