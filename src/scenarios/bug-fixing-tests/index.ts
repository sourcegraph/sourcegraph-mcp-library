import type { Scenario } from "../../types/scenario";
import { dashboardPanelRegressionPrompt } from "./dashboard-panel-regression";

export const bugFixingTests: Scenario = {
  id: "bug-fixing-tests",
  title: "Bug fixing & tests",
  subtitle: "Root-cause fix with test coverage",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  prompts: [
    dashboardPanelRegressionPrompt,
  ],
};
