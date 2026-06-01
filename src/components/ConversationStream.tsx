import { memo, useLayoutEffect, useRef } from "react";
import type { ConversationEvent } from "../types/scenario";
import { ToolCallCard } from "./ToolCallCard";
import "./ConversationStream.css";

interface ConversationStreamProps {
  events: ConversationEvent[];
}

function ConversationStreamImpl({ events }: ConversationStreamProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom as new events stream in so the latest tool call
  // and assistant text stay visible during the demo. useLayoutEffect runs
  // synchronously after DOM mutations so we always read the up-to-date
  // scrollHeight before the browser paints.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [events]);

  // Re-pin to bottom when the container itself resizes (e.g. when the
  // metrics bar reveals on completion and shrinks the available height).
  // Without this, the conversation can end the run scrolled mid-way.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      el.scrollTop = el.scrollHeight;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isEmpty = events.length === 0;

  return (
    <div
      className={`conversation-stream ${isEmpty ? "conversation-stream--empty" : ""}`}
      ref={containerRef}
      aria-live="polite"
    >
      {isEmpty && <p>Waiting for prompt…</p>}
      {events.map((event) => {
        if (event.type === "user") {
          return (
            <div key={event.id} className="conversation-item conversation-item--user">
              <p className="conversation-item__text">{event.text}</p>
            </div>
          );
        }

        if (event.type === "assistant") {
          return (
            <div
              key={event.id}
              className="conversation-item conversation-item--assistant"
            >
              <p className="conversation-item__text">
                {event.text}
                {event.isStreaming && (
                  <span className="conversation-item__cursor" aria-hidden>
                    |
                  </span>
                )}
              </p>
            </div>
          );
        }

        if (event.type === "tool") {
          return (
            <ToolCallCard
              key={event.id}
              name={event.name}
              args={event.args}
              status={event.status}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

export const ConversationStream = memo(ConversationStreamImpl);
