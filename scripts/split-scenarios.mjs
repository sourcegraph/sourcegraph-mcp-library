import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const scenariosDir = path.join(root, "src/scenarios");

const PLACEHOLDER_LOG = (scenarioId, promptId, mode) => `# Claude execution log — ${mode}
#
# Replace this file with the raw claude.log from a live run.
# Scenario: ${scenarioId} / ${promptId}
# Mode: ${mode}
#
# This file is served as proof of live execution.
`;

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function formatTimeline(name, events, includeImport) {
  const importLine = includeImport
    ? `import type { TimelineEvent } from "../../../types/scenario";\n\n`
    : "";
  const lines = events.map((event) => {
    const parts = Object.entries(event).map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}: ${JSON.stringify(value)}`;
      }
      if (Array.isArray(value)) {
        const items = value.map((item) => JSON.stringify(item)).join(",\n      ");
        return `${key}: [\n      ${items},\n    ]`;
      }
      return `${key}: ${JSON.stringify(value)}`;
    });
    return `  { ${parts.join(", ")} }`;
  });
  return `${importLine}export const ${name}: TimelineEvent[] = [
${lines.join(",\n")},
];
`;
}

function metricsKeyForPrompt(scenarioId, promptId) {
  const map = {
    "understand-existing-code": {
      "cross-repo-discovery": "understandSettingsSync",
      "architecture-comprehension": "understandExtensionHost",
      "business-logic": "understandBusinessLogic",
    },
    "code-reuse-consistency": {
      "rpc-retry-consistency": "codeReuseRetry",
    },
    "feature-development-plan": {
      "clipboard-history-api": "featureClipboardHistory",
    },
    "bug-fixing-tests": {
      "dashboard-panel-regression": "bugPanelRegression",
    },
    "incident-investigation": {
      "query-latency-spike": "incidentLatency",
    },
    security: {
      "acl-bypass-review": "securityAclBypass",
    },
    audit: {
      "admin-access-audit": "auditBillingEvents",
    },
  };
  return map[scenarioId]?.[promptId];
}

async function main() {
  const { scenarios } = await import(
    path.join(scenariosDir, "index.ts").replace(/\\/g, "/")
  );

  for (const scenario of scenarios) {
    const scenarioDir = path.join(scenariosDir, scenario.id);
    const promptImports = [];

    for (const prompt of scenario.prompts) {
      const promptDir = path.join(scenarioDir, prompt.id);
      const metricsKey = metricsKeyForPrompt(scenario.id, prompt.id);

      writeFile(
        path.join(promptDir, "without-mcp.claude.log"),
        PLACEHOLDER_LOG(scenario.id, prompt.id, "without MCP"),
      );
      writeFile(
        path.join(promptDir, "with-mcp.claude.log"),
        PLACEHOLDER_LOG(scenario.id, prompt.id, "with MCP"),
      );

      writeFile(
        path.join(promptDir, "timeline.ts"),
        [
          formatTimeline("withoutMCP", prompt.withoutMCP, true),
          formatTimeline("withMCP", prompt.withMCP, false),
        ].join("\n"),
      );

      const envLine = prompt.environment
        ? `  environment: ${JSON.stringify(prompt.environment)},\n`
        : "";

      writeFile(
        path.join(promptDir, "index.ts"),
        `import type { ScenarioPrompt } from "../../../types/scenario";
import { promptMetrics } from "../../prompt-metrics";
import withoutMcpLog from "./without-mcp.claude.log?raw";
import withMcpLog from "./with-mcp.claude.log?raw";
import { withoutMCP, withMCP } from "./timeline";

export const ${toCamelCase(prompt.id)}Prompt: ScenarioPrompt = {
  id: ${JSON.stringify(prompt.id)},
  label: ${JSON.stringify(prompt.label)},
${envLine}  text: ${JSON.stringify(prompt.text)},
  metrics: promptMetrics.${metricsKey},
  withoutMCP,
  withMCP,
  logs: {
    withoutMCP: withoutMcpLog,
    withMCP: withMcpLog,
  },
};
`,
      );

      promptImports.push({
        id: prompt.id,
        exportName: `${toCamelCase(prompt.id)}Prompt`,
      });
    }

    const importLines = promptImports
      .map(
        (p) =>
          `import { ${p.exportName} } from "./${p.id}";`,
      )
      .join("\n");
    const promptList = promptImports.map((p) => `    ${p.exportName},`).join("\n");

    writeFile(
      path.join(scenarioDir, "index.ts"),
      `import type { Scenario } from "../../types/scenario";
${importLines}

export const ${toScenarioExportName(scenario.id)}: Scenario = {
  id: ${JSON.stringify(scenario.id)},
  title: ${JSON.stringify(scenario.title)},
  subtitle: ${JSON.stringify(scenario.subtitle)},
  repo: ${JSON.stringify(scenario.repo)},
  repoUrl: ${JSON.stringify(scenario.repoUrl)},
  prompts: [
${promptList}
  ],
};
`,
    );
  }

  const scenarioExports = scenarios.map((s) => ({
    id: s.id,
    name: toScenarioExportName(s.id),
  }));

  writeFile(
    path.join(scenariosDir, "index.ts"),
    `import type { Scenario } from "../types/scenario";
${scenarioExports.map((s) => `import { ${s.name} } from "./${s.id}";`).join("\n")}

export const scenarios: Scenario[] = [
${scenarioExports.map((s) => `  ${s.name},`).join("\n")}
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
`,
  );

  const legacyFiles = [
    "understand-existing-code.ts",
    "code-reuse-consistency.ts",
    "feature-development-plan.ts",
    "bug-fixing-tests.ts",
    "incident-investigation.ts",
    "security.ts",
    "audit.ts",
  ];

  for (const file of legacyFiles) {
    const filePath = path.join(scenariosDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  console.log("Split scenarios into per-prompt directories.");
}

function toCamelCase(id) {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function toScenarioExportName(id) {
  return toCamelCase(id);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
