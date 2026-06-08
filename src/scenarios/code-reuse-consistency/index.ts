import type { Scenario } from "../../types/scenario";
import { tracerPatternConsistencyPrompt } from "./tracer-pattern-consistency";

export const codeReuseConsistency: Scenario = {
  id: "code-reuse-consistency",
  title: "Code reuse & consistency",
  subtitle: "Consistency and quality across the codebase",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  prompts: [tracerPatternConsistencyPrompt],
};
