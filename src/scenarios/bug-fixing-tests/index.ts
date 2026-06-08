import type { Scenario } from "../../types/scenario";
import { dashboardPanelRegressionPrompt } from "./dashboard-panel-regression";
import { duckdbDucklakeInsertPrompt } from "./duckdb-ducklake-insert";

export const bugFixingTests: Scenario = {
  id: "bug-fixing-tests",
  title: "Bug fixing & tests",
  subtitle: "Root-cause fix with test coverage",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  prompts: [
    dashboardPanelRegressionPrompt,
    duckdbDucklakeInsertPrompt,
  ],
};
