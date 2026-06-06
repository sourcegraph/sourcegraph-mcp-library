import type { AssistantMessage, UserMessage } from "../types/scenario";
import "./MessageStream.css";

interface MessageStreamProps {
  userMessages: UserMessage[];
  assistantMessages: AssistantMessage[];
}

export function MessageStream({
  userMessages,
  assistantMessages,
}: MessageStreamProps) {
  const items: Array<
    | { kind: "user"; msg: UserMessage }
    | { kind: "assistant"; msg: AssistantMessage }
  > = [];

  for (const msg of userMessages) {
    items.push({ kind: "user", msg });
  }
  for (const msg of assistantMessages) {
    items.push({ kind: "assistant", msg });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="message-stream">
      {items.map((item) =>
        item.kind === "user" ? (
          <div key={item.msg.id} className="message message--user">
            <span className="message__label">You</span>
            <p className="message__text">{item.msg.text}</p>
          </div>
        ) : (
          <div
            key={item.msg.id}
            className={`message message--assistant ${item.msg.isStreaming ? "message--streaming" : ""}`}
          >
            <span className="message__label">Agent</span>
            <p className="message__text">
              {item.msg.text}
              {item.msg.isStreaming && (
                <span className="message__cursor" aria-hidden>
                  |
                </span>
              )}
            </p>
          </div>
        ),
      )}
    </div>
  );
}
