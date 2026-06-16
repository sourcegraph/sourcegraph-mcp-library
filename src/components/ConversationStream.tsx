import { memo, useLayoutEffect, useMemo, useRef } from "react";
import type { ConversationEvent } from "../types/scenario";
import { ToolCallCard } from "./ToolCallCard";
import "./ConversationStream.css";

interface ConversationStreamProps {
  events: ConversationEvent[];
}

type MessageBlock =
  | { type: "text"; text: string }
  | { type: "table"; header: string[]; rows: string[][] };

/** A markdown table separator row, e.g. `|---|:--:|`. */
function isTableSeparator(line: string): boolean {
  const t = line.trim();
  return t.includes("|") && t.includes("-") && /^[\s|:-]+$/.test(t);
}

/** Split a markdown table row into trimmed cells. */
function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

/**
 * Parse an assistant message into text and markdown-table blocks. A table is
 * only recognized when a header line is immediately followed by a separator
 * row (`|---|---|`), so inline pipes in ordinary prose are left untouched.
 */
function parseMessageBlocks(text: string): MessageBlock[] {
  const lines = text.split("\n");
  const blocks: MessageBlock[] = [];
  let textBuffer: string[] = [];

  const flushText = () => {
    const joined = textBuffer.join("\n").replace(/^\n+|\n+$/g, "");
    if (joined.trim() !== "") blocks.push({ type: "text", text: joined });
    textBuffer = [];
  };

  let i = 0;
  while (i < lines.length) {
    const isTableStart =
      lines[i].includes("|") &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1]);

    if (isTableStart) {
      flushText();
      const header = splitRow(lines[i]);
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: "table", header, rows });
    } else {
      textBuffer.push(lines[i]);
      i += 1;
    }
  }
  flushText();
  return blocks;
}

/**
 * Render a text block into headings (`#`–`######`) and pre-wrap paragraph
 * runs. Consecutive non-heading lines are grouped so blank-line spacing and
 * inline markup are preserved.
 */
function renderTextBlock(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let para: string[] = [];

  const flushPara = () => {
    const joined = para.join("\n").replace(/^\n+|\n+$/g, "");
    if (joined.trim() !== "") {
      out.push(
        <p key={`${keyPrefix}-p${out.length}`} className="conversation-item__text">
          {renderInline(joined)}
        </p>,
      );
    }
    para = [];
  };

  for (const line of text.split("\n")) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushPara();
      const level = heading[1].length;
      out.push(
        <div
          key={`${keyPrefix}-h${out.length}`}
          className={`conversation-stream__heading conversation-stream__heading--h${level}`}
        >
          {renderInline(heading[2])}
        </div>,
      );
    } else {
      para.push(line);
    }
  }
  flushPara();
  return out;
}

/**
 * Render inline `code` spans and **bold** within a text run. The scan is
 * tolerant of an unclosed trailing marker, so during the typewriter stream a
 * half-typed `` `code `` or `**bold` renders as formatted text without ever
 * showing the marker characters. Single `*` and stray backticks are left as
 * literal text.
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let buf = "";
  let i = 0;
  let key = 0;

  const flush = () => {
    if (buf) {
      nodes.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];
    if (ch === "`") {
      flush();
      const end = text.indexOf("`", i + 1);
      const inner = end === -1 ? text.slice(i + 1) : text.slice(i + 1, end);
      if (inner) {
        nodes.push(
          <code key={`c${key++}`} className="conversation-stream__code">
            {inner}
          </code>,
        );
      }
      i = end === -1 ? text.length : end + 1;
    } else if (ch === "*" && text[i + 1] === "*") {
      flush();
      const end = text.indexOf("**", i + 2);
      const inner = end === -1 ? text.slice(i + 2) : text.slice(i + 2, end);
      if (inner) {
        nodes.push(<strong key={`b${key++}`}>{inner}</strong>);
      }
      i = end === -1 ? text.length : end + 2;
    } else {
      buf += ch;
      i += 1;
    }
  }
  flush();
  return nodes;
}

function AssistantMessage({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const blocks = useMemo(() => parseMessageBlocks(text), [text]);
  const hasTable = blocks.some((b) => b.type === "table");

  // Fast path: plain messages (incl. all streaming ones) render exactly as
  // before, preserving the typewriter cursor.
  if (!hasTable) {
    return (
      <p className="conversation-item__text">
        {renderInline(text)}
        {isStreaming && (
          <span className="conversation-item__cursor" aria-hidden>
            |
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="conversation-item__rich">
      {blocks.map((block, idx) =>
        block.type === "text" ? (
          <div key={idx} className="conversation-item__textblock">
            {renderTextBlock(block.text, `tb${idx}`)}
          </div>
        ) : (
          <table key={idx} className="conversation-stream__table">
            <thead>
              <tr>
                {block.header.map((cell, ci) => (
                  <th key={ci}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ),
      )}
    </div>
  );
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

  const visibleEvents = events.filter((event) => event.type !== "user");
  const isEmpty = visibleEvents.length === 0;

  return (
    <div
      className={`conversation-stream ${isEmpty ? "conversation-stream--empty" : ""}`}
      ref={containerRef}
      aria-live="polite"
    >
      {isEmpty && (
        <p className="conversation-stream__idle-hint">
          Press <kbd>space</kbd> to begin
        </p>
      )}
      {visibleEvents.map((event) => {
        if (event.type === "assistant") {
          return (
            <div
              key={event.id}
              className="conversation-item conversation-item--assistant"
            >
              <AssistantMessage
                text={event.text}
                isStreaming={event.isStreaming ?? false}
              />
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
