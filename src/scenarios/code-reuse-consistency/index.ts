import type { Scenario } from "../../types/scenario";
import { rpcRetryConsistencyPrompt } from "./rpc-retry-consistency";

export const codeReuseConsistency: Scenario = {
  id: "code-reuse-consistency",
  title: "Code reuse & consistency",
  subtitle: "Consistency and quality across the codebase",
  repo: "apache/flink",
  repoUrl: "https://github.com/apache/flink",
  prompts: [
    rpcRetryConsistencyPrompt,
  ],
};
