import type { Scenario } from "../types/scenario";
import { understandExistingCode } from "./understand-existing-code";
import { codeReuseConsistency } from "./code-reuse-consistency";
import { featureDevelopmentPlan } from "./feature-development-plan";
import { bugFixingTests } from "./bug-fixing-tests";
import { incidentInvestigation } from "./incident-investigation";
import { security } from "./security";
import { audit } from "./audit";
import { migrationReadiness } from "./migration-readiness";

export const scenarios: Scenario[] = [
  understandExistingCode,
  codeReuseConsistency,
  featureDevelopmentPlan,
  bugFixingTests,
  incidentInvestigation,
  security,
  audit,
  migrationReadiness,
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
