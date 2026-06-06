// Tool-call argument strings in scenarios are object-literal-shaped strings
// like `{ command: "find ..." }` or `{ query: "RetryStrategy RPC" }`.
// For the compact tool-card view we strip path/qualifier noise so the pill
// shows the essence of what the tool is doing.

const PRIORITY_KEYS = [
  "command",
  "query",
  "path",
  "file_path",
  "symbol",
  "message",
  "rev",
];

/** Extract a string value for `key` from an args object-literal string. */
function extractKey(args: string, key: string): string | null {
  const re = new RegExp(`\\b${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const match = args.match(re);
  return match ? match[1] : null;
}

/** Extract the first quoted string in `args`. */
function firstQuoted(args: string): string | null {
  const match = args.match(/"((?:[^"\\]|\\.)*)"/);
  return match ? match[1] : null;
}

/** Best-effort raw-value pick: priority keys, then first quoted, then raw. */
function rawValue(args: string): string {
  for (const key of PRIORITY_KEYS) {
    const v = extractKey(args, key);
    if (v !== null) return v;
  }
  return firstQuoted(args) ?? args;
}

function basename(path: string): string {
  return path.replace(/\/+$/, "").split("/").pop() || path;
}

/** Compact a `find …` shell command into `find <pattern> <pattern>…`. */
function compactFind(cmd: string): string {
  const names = [...cmd.matchAll(/-name\s+(?:'([^']+)'|"([^"]+)"|(\S+))/g)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
  if (names.length) return `find ${names.join(" ")}`;
  // Fallback: drop everything from the first pipe and any absolute paths.
  return stripAbsolutePaths(cmd.split("|")[0].trim());
}

/** Compact a `grep …` shell command into `grep '<pattern>'`. */
function compactGrep(cmd: string): string {
  // grep [flags] PATTERN [files...] — first quoted arg is the pattern.
  const quoted = cmd.match(/'([^']+)'|"([^"]+)"/);
  if (quoted) return `grep '${quoted[1] ?? quoted[2]}'`;
  return stripAbsolutePaths(cmd.split("|")[0].trim());
}

function stripAbsolutePaths(cmd: string): string {
  return cmd
    .split(/\s+/)
    .filter((tok) => !tok.startsWith("/"))
    .join(" ");
}

function compactBash(args: string): string {
  const cmd = extractKey(args, "command") ?? rawValue(args);
  const verb = cmd.trim().split(/\s+/)[0];
  if (verb === "find") return compactFind(cmd);
  if (verb === "grep") return compactGrep(cmd);
  return stripAbsolutePaths(cmd.split("|")[0].trim());
}

/** Strip Sourcegraph query qualifiers (repo:, file:, lang:, …). */
function stripSgQualifiers(query: string): string {
  const stripped = query
    // file:(a|b|c) — parenthesised alternation
    .replace(/\bfile:\([^)]*\)/g, "")
    // repo:value, file:value, lang:value, etc. until whitespace
    .replace(
      /\b(repo|file|lang|case|type|context|count|select|content|fork|archived|visibility):\S+/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
  if (stripped) return stripped;
  // Fallback: show the file pattern itself if that was the whole query.
  const fileMatch = query.match(/\bfile:(\([^)]+\)|\S+)/);
  if (fileMatch) return fileMatch[1].replace(/^\(|\)$/g, "");
  return query;
}

function compactSearch(args: string): string {
  const q = extractKey(args, "query") ?? rawValue(args);
  return stripSgQualifiers(q);
}

function compactPath(args: string): string {
  const p =
    extractKey(args, "path") ??
    extractKey(args, "file_path") ??
    rawValue(args);
  return basename(p);
}

/**
 * Extract a string value for a given key from an args object-literal string.
 * Returns null if the key is not present.
 */
export function extractArgValue(args: string, key: string): string | null {
  return extractKey(args, key);
}

/**
 * Extract the most informative single value from a tool-call args string for
 * the compact, single-line preview based on the tool's name.
 */
export function compactToolArg(name: string, args: string): string {
  switch (name) {
    case "Bash":
      return compactBash(args);
    case "keyword_search":
    case "sg_keyword_search":
    case "nls_search":
    case "sg_nls_search":
    case "deep_search":
      return compactSearch(args);
    case "Read":
    case "Write":
    case "read_file":
    case "sg_read_file":
    case "sg_list_files":
      return compactPath(args);
    default:
      return rawValue(args);
  }
}
