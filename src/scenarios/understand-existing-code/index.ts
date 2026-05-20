import type { Scenario } from "../../types/scenario";
import { crossRepoDiscoveryPrompt } from "./cross-repo-discovery";
import { architectureComprehensionPrompt } from "./architecture-comprehension";
import { businessLogicPrompt } from "./business-logic";

export const understandExistingCode: Scenario = {
  id: "understand-existing-code",
  title: "Understanding existing code",
  subtitle: "Explore unfamiliar codebases",
  repo: "microsoft/vscode",
  repoUrl: "https://github.com/microsoft/vscode",
  prompts: [
    crossRepoDiscoveryPrompt,
    architectureComprehensionPrompt,
    businessLogicPrompt,
  ],
};
