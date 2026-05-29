import type { ConversationEvent } from "../types/scenario";
import { ToolCallCard } from "./ToolCallCard";
import "./ConversationStream.css";

interface ConversationStreamProps {
  events: ConversationEvent[];
}

export function ConversationStream({ events }: ConversationStreamProps) {
  if (events.length === 0) {
    return (
      <div className="conversation-stream conversation-stream--empty">
        <p>Waiting for prompt…</p>
      </div>
    );
  }

  return (
    <div className="conversation-stream">
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
              className={`conversation-item conversation-item--assistant ${event.isStreaming ? "conversation-item--streaming" : ""}`}
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
              tool={{
                id: event.id,
                name: event.name,
                args: event.args,
                status: event.status,
              }}
            />
          );
        }

        if (event.type === "missed") {
          return (
            <div key={`missed-${event.items[0]}`} className="conversation-item conversation-item--info">
              <p className="conversation-item__text">
                Items the agent didn't consider: {event.items.join(", ")}
              </p>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
