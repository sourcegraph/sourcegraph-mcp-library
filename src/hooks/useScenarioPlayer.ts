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

type PlaybackStatus = "idle" | "playing" | "paused" | "finished";

type PlaybackConfig = {
  withoutEvents: TimelineEvent[];
  withEvents: TimelineEvent[];
  withoutEnd: number;
  withEnd: number;
  totalDuration: number;
  reducedMotion: boolean;
};

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
  startIndex = 0,
) {
  let index = startIndex;
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

function eventAt(event: TimelineEvent, completeAt: number): number {
  return event.type === "complete" ? completeAt : event.at;
}

function buildStepBoundaries(config: PlaybackConfig): number[] {
  const times = new Set<number>([0]);

  const collect = (events: TimelineEvent[], completeAt: number) => {
    for (const event of events) {
      times.add(eventAt(event, completeAt));
    }
  };

  collect(config.withoutEvents, config.withoutEnd);
  collect(config.withEvents, config.withEnd);

  return Array.from(times).sort((a, b) => a - b);
}

function stepIndexForElapsed(boundaries: number[], elapsed: number): number {
  let idx = 0;
  for (let i = 0; i < boundaries.length; i++) {
    if (boundaries[i] <= elapsed) idx = i;
    else break;
  }
  return idx;
}

function applyEventInstant(
  state: ColumnState,
  event: TimelineEvent,
): ColumnState {
  if (event.type === "assistant" && event.stream) {
    return applyEvent(state, { ...event, stream: false });
  }
  return applyEvent(state, event);
}

function buildStateAtElapsed(
  events: TimelineEvent[],
  completeAt: number,
  elapsed: number,
): ColumnState {
  let state = emptyColumnState();
  for (const event of events) {
    const at = eventAt(event, completeAt);
    if (at > elapsed) break;
    state = applyEventInstant(state, event);
  }
  return state;
}

function playbackStatusAtElapsed(
  elapsed: number,
  config: PlaybackConfig,
): PlaybackStatus {
  if (elapsed <= 0) return "idle";
  const lastContentEnd = Math.max(config.withoutEnd, config.withEnd);
  if (elapsed >= lastContentEnd) return "finished";
  return "paused";
}

function buildPlaybackConfig(prompt: ScenarioPrompt): PlaybackConfig {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
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

  return {
    withoutEvents: prompt.withoutMCP,
    withEvents: prompt.withMCP,
    withoutEnd,
    withEnd,
    totalDuration,
    reducedMotion,
  };
}

export function useScenarioPlayer(prompt: ScenarioPrompt | null) {
  const [withoutState, setWithoutState] = useState<ColumnState>(
    emptyColumnState,
  );
  const [withState, setWithState] = useState<ColumnState>(emptyColumnState);
  const [playbackStatus, setPlaybackStatus] =
    useState<PlaybackStatus>("idle");
  const [playKey, setPlayKey] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepCount, setStepCount] = useState(1);

  const configRef = useRef<PlaybackConfig | null>(null);
  const stepBoundariesRef = useRef<number[]>([0]);
  const elapsedRef = useRef(0);
  const withoutStateRef = useRef(withoutState);
  const withStateRef = useRef(withState);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  withoutStateRef.current = withoutState;
  withStateRef.current = withState;

  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];
  }, []);

  const fireEvent = useCallback(
    (
      event: TimelineEvent,
      setState: React.Dispatch<React.SetStateAction<ColumnState>>,
      reducedMotion: boolean,
    ) => {
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
        setState((prev) =>
          applyEvent(prev, { ...event, stream: false }),
        );
      } else {
        setState((prev) => applyEvent(prev, event));
      }
    },
    [],
  );

  const resumeActiveStreams = useCallback(
    (
      state: ColumnState,
      events: TimelineEvent[],
      setState: React.Dispatch<React.SetStateAction<ColumnState>>,
      reducedMotion: boolean,
    ) => {
      if (reducedMotion) return;
      for (const convEvent of state.events) {
        if (convEvent.type !== "assistant" || !convEvent.isStreaming) continue;
        const timelineEvent = events.find(
          (e) =>
            e.type === "assistant" &&
            `asst-${e.at}` === convEvent.id &&
            e.stream,
        );
        if (timelineEvent?.type !== "assistant") continue;
        const interval = streamAssistantText(
          setState,
          convEvent.id,
          timelineEvent.text,
          STREAM_CHUNK_MS,
          convEvent.text.length,
        );
        intervalsRef.current.push(interval);
      }
    },
    [],
  );

  const scheduleFrom = useCallback(
    (fromElapsed: number) => {
      const config = configRef.current;
      if (!config) return;

      const scheduleColumn = (
        events: TimelineEvent[],
        setState: React.Dispatch<React.SetStateAction<ColumnState>>,
        completeAt: number,
        columnState: ColumnState,
      ) => {
        resumeActiveStreams(
          columnState,
          events,
          setState,
          config.reducedMotion,
        );

        for (const event of events) {
          const at = event.type === "complete" ? completeAt : event.at;
          // On a fresh start (fromElapsed === 0) we must still fire events at
          // at: 0; only skip events strictly before the start. When resuming
          // mid-timeline we skip everything up to and including fromElapsed so
          // already-played events don't re-fire.
          if (fromElapsed === 0 ? at < fromElapsed : at <= fromElapsed) continue;
          const delay = at - fromElapsed;
          const timer = setTimeout(() => {
            fireEvent(event, setState, config.reducedMotion);
          }, delay);
          timersRef.current.push(timer);
        }
      };

      scheduleColumn(
        config.withoutEvents,
        setWithoutState,
        config.withoutEnd,
        withoutStateRef.current,
      );
      scheduleColumn(
        config.withEvents,
        setWithState,
        config.withEnd,
        withStateRef.current,
      );

      const remaining = config.totalDuration - fromElapsed;
      if (remaining > 0) {
        const endTimer = setTimeout(() => {
          setPlaybackStatus("finished");
        }, remaining);
        timersRef.current.push(endTimer);
      } else {
        setPlaybackStatus("finished");
      }
    },
    [fireEvent, resumeActiveStreams],
  );

  const startPlayback = useCallback(
    (fromElapsed: number) => {
      clearAll();
      scheduleFrom(fromElapsed);
      setPlaybackStatus("playing");
    },
    [clearAll, scheduleFrom],
  );

  const pausePlayback = useCallback(() => {
    clearAll();
    setPlaybackStatus("paused");
    setStepIndex(
      stepIndexForElapsed(stepBoundariesRef.current, elapsedRef.current),
    );
  }, [clearAll]);

  const seekToElapsed = useCallback(
    (elapsed: number) => {
      const config = configRef.current;
      if (!config) return;

      clearAll();
      elapsedRef.current = elapsed;
      setWithoutState(
        buildStateAtElapsed(
          config.withoutEvents,
          config.withoutEnd,
          elapsed,
        ),
      );
      setWithState(
        buildStateAtElapsed(config.withEvents, config.withEnd, elapsed),
      );
      setPlaybackStatus(playbackStatusAtElapsed(elapsed, config));
      setStepIndex(stepIndexForElapsed(stepBoundariesRef.current, elapsed));
    },
    [clearAll],
  );

  const stepForward = useCallback(() => {
    const boundaries = stepBoundariesRef.current;
    const idx = stepIndexForElapsed(boundaries, elapsedRef.current);
    if (idx >= boundaries.length - 1) return;
    seekToElapsed(boundaries[idx + 1]);
  }, [seekToElapsed]);

  const stepBackward = useCallback(() => {
    const boundaries = stepBoundariesRef.current;
    const idx = stepIndexForElapsed(boundaries, elapsedRef.current);
    if (idx <= 0) return;
    seekToElapsed(boundaries[idx - 1]);
  }, [seekToElapsed]);

  const togglePlayPause = useCallback(() => {
    if (!configRef.current) return;

    switch (playbackStatus) {
      case "idle":
        elapsedRef.current = 0;
        startPlayback(0);
        break;
      case "playing":
        pausePlayback();
        break;
      case "paused":
        startPlayback(elapsedRef.current);
        break;
      case "finished":
        clearAll();
        setWithoutState(emptyColumnState());
        setWithState(emptyColumnState());
        elapsedRef.current = 0;
        startPlayback(0);
        break;
    }
  }, [playbackStatus, clearAll, pausePlayback, startPlayback]);

  const replay = useCallback(() => {
    clearAll();
    setWithoutState(emptyColumnState());
    setWithState(emptyColumnState());
    elapsedRef.current = 0;
    setStepIndex(0);
    setPlaybackStatus("idle");
    setPlayKey((k) => k + 1);
  }, [clearAll]);

  useEffect(() => {
    if (!prompt) {
      configRef.current = null;
      return;
    }

    if (import.meta.env.DEV) {
      validateScenario(prompt);
    }

    clearAll();
    setWithoutState(emptyColumnState());
    setWithState(emptyColumnState());
    elapsedRef.current = 0;
    setStepIndex(0);
    setPlaybackStatus("idle");
    const config = buildPlaybackConfig(prompt);
    configRef.current = config;
    const boundaries = buildStepBoundaries(config);
    stepBoundariesRef.current = boundaries;
    setStepCount(boundaries.length);

    return clearAll;
  }, [prompt, playKey, clearAll]);

  // Track elapsed playback time while playing so pause can resume mid-timeline.
  useEffect(() => {
    if (playbackStatus !== "playing") return;

    const startedAt = performance.now();
    const baseElapsed = elapsedRef.current;

    const tick = () => {
      elapsedRef.current =
        baseElapsed + (performance.now() - startedAt);
    };

    const interval = setInterval(tick, 100);
    return () => {
      clearInterval(interval);
      tick();
    };
  }, [playbackStatus, playKey]);

  return {
    withoutState,
    withState,
    isPlaying: playbackStatus === "playing",
    isPaused: playbackStatus === "paused",
    playbackStatus,
    togglePlayPause,
    replay,
    stepIndex,
    stepCount,
    canStepBack: stepIndex > 0,
    canStepForward: stepIndex < stepCount - 1,
    stepForward,
    stepBackward,
  };
}
