import type { Scenario } from "../../types/scenario";
import { crossRepoDiscoveryPrompt } from "./cross-repo-discovery";
import { businessLogicPrompt } from "./business-logic";
import { flinkCheckpointArchPrompt } from "./flink-checkpoint-arch-001";
import { grpcTimeoutCrossRepoPrompt } from "./grpc-timeout-cross-repo";

export const understandExistingCode: Scenario = {
  id: "understand-existing-code",
  title: "Understanding existing code",
  subtitle: "Explore unfamiliar codebases",
  repo: "microsoft/vscode",
  repoUrl: "https://github.com/microsoft/vscode",
  prompts: [
    grpcTimeoutCrossRepoPrompt,
    crossRepoDiscoveryPrompt,
    businessLogicPrompt,
    flinkCheckpointArchPrompt,
  ],
};
