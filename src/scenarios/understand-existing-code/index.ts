import type { Scenario } from "../../types/scenario";
import { adsMultiRepoBusinessLogicPrompt } from "./ads-multi-repo-business-logic";
import { grpcTimeoutCrossRepoPrompt } from "./grpc-timeout-cross-repo";
import { flinkCheckpointArchPrompt } from "./flink-checkpoint-arch-001"

export const understandExistingCode: Scenario = {
  id: "understand-existing-code",
  title: "Understanding existing code",
  subtitle: "Explore unfamiliar codebases",
  prompts: [
    adsMultiRepoBusinessLogicPrompt,
    grpcTimeoutCrossRepoPrompt,
    flinkCheckpointArchPrompt,
  ],
};
