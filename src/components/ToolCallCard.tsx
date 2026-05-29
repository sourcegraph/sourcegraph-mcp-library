import { useEffect, useRef, useState } from "react";
import type { ToolCall } from "../types/scenario";
import { compactToolArg, extractArgValue } from "../utils/toolArgs";
import "./ToolCallCard.css";

interface ToolCallCardProps {
  tool: ToolCall;
}

const COPYABLE_TOOLS = new Set(["keyword_search", "sg_keyword_search"]);

export function ToolCallCard({ tool }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const isRunning = tool.status === "running";
  const compact = compactToolArg(tool.name, tool.args);
  const copyableQuery = COPYABLE_TOOLS.has(tool.name)
    ? extractArgValue(tool.args, "query")
    : null;

  const handleCopy = async () => {
    if (!copyableQuery) return;
    try {
      await navigator.clipboard.writeText(copyableQuery);
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  };

  return (
    <div
      className={`tool-card ${isRunning ? "tool-card--running" : ""} ${
        expanded ? "tool-card--expanded" : "tool-card--collapsed"
      }`}
    >
      <button
        type="button"
        className="tool-card__main"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="tool-card__name">
          {tool.name.replace(/^sg_/, "")}
        </span>
        <span className="tool-card__args">
          {expanded ? tool.args : compact}
        </span>
        {isRunning && <span className="tool-card__dot" aria-label="running" />}
      </button>
      {copyableQuery && (
        <button
          type="button"
          className={`tool-card__copy ${
            copied ? "tool-card__copy--copied" : ""
          }`}
          aria-label={copied ? "Copied" : "Copy query"}
          title={copied ? "Copied!" : "Copy full query"}
          onClick={handleCopy}
        >
          {copied ? (
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 8.5 6.5 12 13 4.5" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="5" width="9" height="9" rx="1.5" />
              <path d="M3 11V3a1 1 0 0 1 1-1h7" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
