import type { Scenario } from "../../types/scenario";
import { queryLatencySpikePrompt } from "./query-latency-spike";

export const incidentInvestigation: Scenario = {
  id: "incident-investigation",
  title: "Investigating an incident",
  subtitle: "Trace regressions across services",
  repo: "grafana/grafana",
  repoUrl: "https://github.com/grafana/grafana",
  prompts: [
    queryLatencySpikePrompt,
  ],
};
