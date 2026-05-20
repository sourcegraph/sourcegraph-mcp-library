import type { Scenario } from "../../types/scenario";
import { userRoleFeaturePrompt } from "./user-role-feature";

export const featureDevelopmentPlan: Scenario = {
  id: "feature-development-plan",
  title: "Feature development",
  subtitle: "Plan mode & implementation planning with Deep Search",
  repo: "sourcegraph/sourcegraph",
  repoUrl: "https://github.com/sourcegraph/sourcegraph",
  prompts: [
    userRoleFeaturePrompt,
  ],
};
