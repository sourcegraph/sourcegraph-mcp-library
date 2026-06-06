import type { Scenario } from "../../types/scenario";
import { grafanaV38FieldConfigMigrationPrompt } from "./grafana-v38-fieldconfig-migration";

export const incidentInvestigation: Scenario = {
  id: "incident-investigation",
  title: "Investigating an incident",
  subtitle: "Trace regressions across services",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  showConfidence: true,
  prompts: [
    grafanaV38FieldConfigMigrationPrompt,
  ],
};
