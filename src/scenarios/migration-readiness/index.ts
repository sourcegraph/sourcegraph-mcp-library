import type { Scenario } from "../../types/scenario";
import { nextjsLinkRemovalAuditPrompt } from "./nextjs-link-removal-audit";

export const migrationReadiness: Scenario = {
  id: "migration-readiness",
  title: "Migration readiness",
  subtitle: "Upgrade blast radius and codemod risk analysis",
  repo: "vercel/next.js + remix-run/react-router",
  repoUrl: "https://github.com/vercel/next.js",
  prompts: [
    nextjsLinkRemovalAuditPrompt,
  ],
};
