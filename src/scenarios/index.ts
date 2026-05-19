import type { Scenario } from "../types/scenario";
import { audit } from "./audit";
import { bugFixingTests } from "./bug-fixing-tests";
import { codeReuseConsistency } from "./code-reuse-consistency";
import { featureDevelopmentPlan } from "./feature-development-plan";
import { incidentInvestigation } from "./incident-investigation";
import { security } from "./security";
import { understandExistingCode } from "./understand-existing-code";

export const scenarios: Scenario[] = [
  understandExistingCode,
  codeReuseConsistency,
  featureDevelopmentPlan,
  bugFixingTests,
  incidentInvestigation,
  security,
  audit,
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
