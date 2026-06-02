export function downloadLog(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildLogFilename(
  scenarioId: string,
  promptId: string,
  variant: "plain" | "mcp",
  fileExtension: "log" | "json" = "log",
): string {
  const mode = variant === "mcp" ? "with-mcp" : "without-mcp";
  return `${scenarioId}__${promptId}__${mode}.claude.${fileExtension}`;
}
