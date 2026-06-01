import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ColumnState,
  ConversationEvent,
  ScenarioPrompt,
  TimelineEvent,
} from "../types/scenario";
import { emptyColumnState } from "../types/scenario";

// Streaming pacing for assistant messages. Kept here so we can compute when
// playback (including in-progress typewriter text) actually finishes.
const STREAM_CHARS_PER_TICK = 3;
const STREAM_CHUNK_MS = 18;

function getRenderDoneTime(events: TimelineEvent[]): number {
  return events.reduce((max, event) => {
    const streamMs =
      event.type === "assistant" && event.stream
        ? Math.ceil(event.text.length / STREAM_CHARS_PER_TICK) *
          STREAM_CHUNK_MS
        : 0;
    return Math.max(max, event.at + streamMs);
  }, 0);
}

function applyEvent(state: ColumnState, event: TimelineEvent): ColumnState {
  const next = { ...state };

  switch (event.type) {
    case "user": {
      const convEvent: ConversationEvent = {
        type: "user",
        id: `user-${event.at}`,
        text: event.text,
      };
      next.events = [...next.events, convEvent];
      break;
    }
    case "assistant": {
      const convEvent: ConversationEvent = {
        type: "assistant",
        id: `asst-${event.at}`,
        text: event.text,
        isStreaming: event.stream ?? false,
      };
      next.events = [...next.events, convEvent];
      break;
    }
    case "tool": {
      // When the same tool call transitions running → done, reuse the
      // existing React key so the card updates in place instead of
      // remounting (which would reset expanded/copied state and replay
      // the entry animation).
      const existing = next.events.findIndex(
        (e) =>
          e.type === "tool" &&
          e.name === event.name &&
          e.args === event.args,
      );
      const existingEvent =
        existing >= 0 ? next.events[existing] : undefined;
      const id =
        existingEvent?.type === "tool"
          ? existingEvent.id
          : `tool-${event.at}-${event.name}`;
      const convEvent: ConversationEvent = {
        type: "tool",
        id,
        name: event.name,
        args: event.args,
        status: event.status ?? "done",
      };
      if (existing >= 0) {
        const updated = [...next.events];
        updated[existing] = convEvent;
        next.events = updated;
      } else {
        next.events = [...next.events, convEvent];
      }
      break;
    }
    case "complete":
      next.completed = true;
      next.events = next.events.map((e) =>
        e.type === "assistant" ? { ...e, isStreaming: false } : e,
      );
      next.events = [...next.events, { type: "complete" }];
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
      events: prev.events.map((e) =>
        e.type === "assistant" && e.id === messageId
          ? { ...e, text: partial }
          : e,
      ),
    }));
    if (index >= fullText.length) {
      clearInterval(interval);
      setState((prev) => ({
        ...prev,
        events: prev.events.map((e) =>
          e.type === "assistant" && e.id === messageId
            ? { ...e, text: fullText, isStreaming: false }
            : e,
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

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const withoutMax = reducedMotion
      ? prompt.withoutMCP.reduce((m, e) => Math.max(m, e.at), 0)
      : getRenderDoneTime(prompt.withoutMCP);
    const withMax = reducedMotion
      ? prompt.withMCP.reduce((m, e) => Math.max(m, e.at), 0)
      : getRenderDoneTime(prompt.withMCP);
    const totalDuration = Math.max(withoutMax, withMax) + 500;
    setIsPlaying(true);

    const schedule = (
      events: TimelineEvent[],
      setState: React.Dispatch<React.SetStateAction<ColumnState>>,
    ) => {
      for (const event of events) {
        const timer = setTimeout(() => {
          if (event.type === "assistant" && event.stream && !reducedMotion) {
            const messageId = `asst-${event.at}`;
            setState((prev) =>
              applyEvent(prev, { ...event, text: "", stream: true }),
            );
            const interval = streamAssistantText(
              setState,
              messageId,
              event.text,
              18,
            );
            intervalsRef.current.push(interval);
          } else if (event.type === "assistant" && event.stream) {
            // Reduced motion: render the assistant message in full immediately.
            setState((prev) =>
              applyEvent(prev, { ...event, stream: false }),
            );
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
