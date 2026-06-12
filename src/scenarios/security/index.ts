import type { Scenario } from "../../types/scenario";
import { aclCodeAuditPrompt } from "./acl-code-audit";

export const security: Scenario = {
  id: "security",
  title: "Security",
  subtitle: "Authorization risks & vulnerability discovery",
  repo: "apache/kafka",
  repoUrl: "https://github.com/apache/kafka",
  prompts: [
    aclCodeAuditPrompt,
  ],
};
