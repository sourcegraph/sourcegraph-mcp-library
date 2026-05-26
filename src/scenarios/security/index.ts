import type { Scenario } from "../../types/scenario";
import { aclBypassReviewPrompt } from "./acl-bypass-review";
import { aclCodeAuditPrompt } from "./acl-code-audit";

export const security: Scenario = {
  id: "security",
  title: "Security",
  subtitle: "Authorization risks & vulnerability discovery",
  repo: "apache/kafka",
  repoUrl: "https://github.com/apache/kafka",
  prompts: [
    aclBypassReviewPrompt,
    aclCodeAuditPrompt,
  ],
};
