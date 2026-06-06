import type { Scenario } from "../../types/scenario";
import { clipboardHistoryApiPrompt } from "./clipboard-history-api";

export const featureDevelopmentPlan: Scenario = {
  id: "feature-development-plan",
  title: "Feature development",
  subtitle: "Plan mode & implementation planning with Deep Search",
  repo: "microsoft/vscode",
  repoUrl: "https://github.com/microsoft/vscode",
  showConfidence: false,
  prompts: [
    clipboardHistoryApiPrompt,
  ],
};
