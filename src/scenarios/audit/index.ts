import type { Scenario } from "../../types/scenario";
import { adminAccessAuditPrompt } from "./admin-access-audit";

export const audit: Scenario = {
  id: "audit",
  title: "Audit",
  subtitle: "Access mapping & compliance trail coverage",
  repo: "apache/kafka",
  repoUrl: "https://github.com/apache/kafka",
  prompts: [
    adminAccessAuditPrompt,
  ],
};
