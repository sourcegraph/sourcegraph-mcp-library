import { memo, useEffect, useRef, useState } from "react";
import type { ToolStatus } from "../types/scenario";
import { compactToolArg, extractArgValue, stripArgKey } from "../utils/toolArgs";
import "./ToolCallCard.css";

interface ToolCallCardProps {
  name: string;
  args: string;
  status: ToolStatus;
}

const COPYABLE_TOOLS = new Set(["keyword_search", "sg_keyword_search"]);

const DEFINITION_LINK_TOOLS = new Set([
  "go_to_definition",
  "sg_go_to_definition",
  "find_references",
  "sg_find_references",
]);

const DOWNLOAD_TOOLS = new Set(["Skill"]);

/** Allow only http(s) URLs so a malformed/unsafe `url` arg can't be linked. */
function safeExternalHref(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/**
 * Allow downloadable-artifact hrefs produced by a Vite `?url` import: a small
 * file is inlined as a `data:text/markdown;base64,...` URL, a larger one
 * resolves to a root-relative `/assets/...` path. http(s) is also accepted.
 */
function safeDownloadHref(value: string | null): string | null {
  if (!value) return null;
  if (/^data:text\/(markdown|plain);/.test(value)) return value;
  if (value.startsWith("/")) return value;
  return safeExternalHref(value);
}

function ToolCallCardImpl({ name, args, status }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const isRunning = status === "running";
  const compact = compactToolArg(name, args);
  // `url` is presentation-only metadata for the link icon; hide it from the
  // expanded raw-args view.
  const expandedArgs = stripArgKey(args, "url");
  const definitionHref =
    !isRunning && DEFINITION_LINK_TOOLS.has(name)
      ? safeExternalHref(extractArgValue(args, "url"))
      : null;
  const downloadHref =
    !isRunning && DOWNLOAD_TOOLS.has(name)
      ? safeDownloadHref(extractArgValue(args, "url"))
      : null;
  const copyableQuery =
    !definitionHref && !downloadHref && COPYABLE_TOOLS.has(name)
      ? extractArgValue(args, "query")
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
          {name.replace(/^sg_/, "")}
        </span>
        <span className="tool-card__args">
          {expanded ? expandedArgs : compact}
        </span>
        {isRunning && <span className="tool-card__dot" aria-label="running" />}
      </button>
      {definitionHref && (
        <a
          className="tool-card__action tool-card__link"
          href={definitionHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Sourcegraph (new tab)"
          title="Open in Sourcegraph"
        >
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
            <path d="M6.5 9.5 9.5 6.5" />
            <path d="M7.6 4.4 8.8 3.2a3 3 0 0 1 4.2 4.2l-1.2 1.2" />
            <path d="M8.4 11.6 7.2 12.8a3 3 0 0 1-4.2-4.2l1.2-1.2" />
          </svg>
        </a>
      )}
      {downloadHref && (
        <a
          className="tool-card__action tool-card__link"
          href={downloadHref}
          download="SKILL.md"
          aria-label="Download SKILL.md"
          title="Download SKILL.md"
        >
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
            <path d="M8 2.5v7" />
            <path d="M5 6.5 8 9.5l3-3" />
            <path d="M3 12.5h10" />
          </svg>
        </a>
      )}
      {copyableQuery && (
        <button
          type="button"
          className={`tool-card__action tool-card__copy ${
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

export const ToolCallCard = memo(ToolCallCardImpl);
