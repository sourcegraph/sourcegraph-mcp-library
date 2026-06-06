import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ColumnState,
  ConversationEvent,
  ScenarioPrompt,
  TimelineEvent,
} from "../types/scenario";
import { emptyColumnState } from "../types/scenario";
import {
  COMPLETE_BUFFER_MS,
  PLAYBACK_TAIL_MS,
  STREAM_CHARS_PER_TICK,
  STREAM_CHUNK_MS,
} from "../utils/playbackTiming";
import { validateScenario } from "../utils/validateScenario";

function eventRenderEnd(event: TimelineEvent): number {
  const streamMs =
    event.type === "assistant" && event.stream
      ? Math.ceil(event.text.length / STREAM_CHARS_PER_TICK) * STREAM_CHUNK_MS
      : 0;
  return event.at + streamMs;
}

/**
 * Stable React key for a tool card. Uses the explicit `id` when present
 * so a `running` and its later `done` event collide on the same key even
 * if `args` was shortened.
 */
function toolCardId(
  event: Extract<TimelineEvent, { type: "tool" }>,
): string {
  return event.id ? `tool-${event.id}` : `tool-${event.at}-${event.name}`;
}

/** Time at which the last non-complete event has fully rendered. */
function getContentEndTime(events: TimelineEvent[]): number {
  return events.reduce(
    (max, event) =>
      event.type === "complete" ? max : Math.max(max, eventRenderEnd(event)),
    0,
  );
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
      //
      // Matching strategy, in order:
      //   1. Explicit `id` on the timeline event (most robust — survives
      //      `args` being shortened on the `done` event).
      //   2. Same `name + args` AND existing status is still "running"
      //      (so the same tool fired twice doesn't stomp on the first).
      const existing = next.events.findIndex((e) => {
        if (e.type !== "tool") return false;
        if (event.id && e.id === toolCardId(event)) return true;
        return (
          e.status === "running" &&
          e.name === event.name &&
          e.args === event.args
        );
      });
      const existingEvent =
        existing >= 0 ? next.events[existing] : undefined;
      const id =
        existingEvent?.type === "tool"
          ? existingEvent.id
          : toolCardId(event);
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
    index += STREAM_CHARS_PER_TICK;
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

    if (import.meta.env.DEV) {
      validateScenario(prompt);
    }

    clearAll();
    setWithoutState(emptyColumnState());
    setWithState(emptyColumnState());

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // Each column's natural finish is "last content fully rendered + small buffer".
    // We override any per-scenario `complete.at` so authors don't each have to
    // tune dead time. Reduced motion skips streaming, so use raw `at` values.
    const naturalEnd = (events: TimelineEvent[]) =>
      reducedMotion
        ? events.reduce(
            (m, e) => (e.type === "complete" ? m : Math.max(m, e.at)),
            0,
          )
        : getContentEndTime(events);
    const withoutEnd = naturalEnd(prompt.withoutMCP) + COMPLETE_BUFFER_MS;
    const withEnd = naturalEnd(prompt.withMCP) + COMPLETE_BUFFER_MS;
    const totalDuration = Math.max(withoutEnd, withEnd) + PLAYBACK_TAIL_MS;
    setIsPlaying(true);

    const schedule = (
      events: TimelineEvent[],
      setState: React.Dispatch<React.SetStateAction<ColumnState>>,
      completeAt: number,
    ) => {
      for (const event of events) {
        const at = event.type === "complete" ? completeAt : event.at;
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
              STREAM_CHUNK_MS,
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
        }, at);
        timersRef.current.push(timer);
      }
    };

    schedule(prompt.withoutMCP, setWithoutState, withoutEnd);
    schedule(prompt.withMCP, setWithState, withEnd);

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
