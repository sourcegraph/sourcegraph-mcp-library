import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 700, type: "assistant", text: "I'll search the local workspace for files with Authorizer or Acl in their names under clients/src/main and core/src/main.", stream: true },
  { at: 1800, type: "tool", name: "Bash", args: "{ command: \"find /workspace/kafka--0753c489/clients/src/main -name '*Authorizer*.java' -o -name '*Acl*.java'\" }", status: "done" },
  { at: 2400, type: "tool", name: "Bash", args: "{ command: \"find /workspace/kafka--0753c489/core/src/main -name '*Authorizer*.java' -o -name '*Acl*.java'\" }", status: "done" },
  { at: 3100, type: "tool", name: "Read", args: "{ file_path: \"/workspace/kafka--0753c489/clients/src/main/java/org/apache/kafka/server/authorizer/Authorizer.java\" }", status: "done" },
  { at: 3500, type: "tool", name: "Bash", args: "{ command: \"find /workspace/kafka--0753c489 -type f -name '*AclAuthorizer*' | sort\" }", status: "done" },
  { at: 3900, type: "tool", name: "Bash", args: "{ command: \"find /workspace/kafka--0753c489/clients/src/main/java/org/apache/kafka/common/acl -type f -name '*.java' | sort\" }", status: "done" },
  { at: 4500, type: "tool", name: "Bash", args: "{ command: \"grep -l 'class.*Acl\\|interface.*Acl' /workspace/kafka--0753c489/clients/src/main/java/org/apache/kafka/clients/admin/*.java\" }", status: "done" },
  { at: 4900, type: "tool", name: "Write", args: "{ file_path: \"/workspace/answer.json\" }", status: "done" },
  { at: 5200, type: "assistant", text: "Found 21 files under clients/src/main — including Authorizer interface, ACL data model, and admin API classes. No authorizer implementations found in core/src/main.", stream: true },
  { at: 5800, type: "missed", items: [
      "metadata/authorizer/StandardAuthorizer.java — KRaft authorizer impl not found",
      "metadata/authorizer/ClusterMetadataAuthorizer.java — KRaft interface not found",
      "metadata/authorizer/StandardAuthorizerData.java — in-memory ACL state not found",
      "metadata/authorizer/AclCache.java — ACL cache not found",
      "metadata/authorizer/AclMutator.java — mutation interface not found",
      "server/security/authorizer/AclEntry.java — server ACL class not found",
      "server/security/authorizer/AuthorizerUtils.java — not found",
      "Action.java, AuthorizableRequestContext.java, AuthorizationResult.java — missed by filename glob",
    ] },
  { at: 6300, type: "complete" },
];

export const withMCP: TimelineEvent[] = [
  { at: 200, type: "assistant", text: "I'll search the local workspace for files with Authorizer or Acl in their names under clients/src/main and core/src/main.", stream: true },
  { at: 500, type: "tool", name: "sg_keyword_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ file:(core/src/main|clients/src/main) (Authorizer OR AclAuthorizer)\" }", status: "running" },
  { at: 1100, type: "tool", name: "sg_keyword_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ file:(core/src/main|clients/src/main) (Authorizer OR AclAuthorizer)\" }", status: "done" },
  { at: 1700, type: "tool", name: "sg_nls_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ file:(core/src/main|clients/src/main) class.*Authorizer implements interface\" }", status: "done" },
  { at: 2100, type: "tool", name: "sg_keyword_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ file:.*Authorizer.*\\.java\" }", status: "done" },
  { at: 2500, type: "tool", name: "sg_keyword_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ implements Authorizer\" }", status: "done" },
  { at: 3000, type: "tool", name: "sg_keyword_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ ClusterMetadataAuthorizer\" }", status: "done" },
  { at: 3300, type: "tool", name: "sg_list_files", args: "{ repo: \"github.com/sg-evals/kafka--0753c489\", path: \"metadata/src/main/java/org/apache/kafka/metadata/authorizer\" }", status: "done" },
  { at: 3900, type: "tool", name: "sg_read_file", args: "{ repo: \"github.com/sg-evals/kafka--0753c489\", path: \"metadata/src/main/java/org/apache/kafka/metadata/authorizer/StandardAuthorizer.java\" }", status: "done" },
  { at: 4200, type: "tool", name: "sg_nls_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ file:core/src/main authorizer implementation ACL\" }", status: "done" },
  { at: 4500, type: "tool", name: "sg_keyword_search", args: "{ query: \"repo:^github.com/sg-evals/kafka--0753c489$ MonitorableAuthorizer\" }", status: "done" },
  { at: 5000, type: "tool", name: "Write", args: "{ file_path: \"/workspace/answer.json\" }", status: "done" },
  { at: 5300, type: "assistant", text: "Found 20 files across 4 directory areas:\n• clients/common/acl/ — ACL data model (AccessControlEntry, AclBinding, AclOperation…)\n• clients/server/authorizer/ — Authorizer interface + Action, AuthorizableRequestContext…\n• server/security/authorizer/ — AclEntry, AuthorizerUtils\n• metadata/metadata/authorizer/ — StandardAuthorizer, ClusterMetadataAuthorizer, AclCache, AclMutator…", stream: true },
  { at: 6100, type: "missed", items: [
      "clients/common/acl/ — 7 ACL data model files found",
      "clients/server/authorizer/ — Authorizer interface + 6 supporting classes found",
      "server/security/authorizer/ — AclEntry and AuthorizerUtils found",
      "metadata/metadata/authorizer/ — full KRaft authorizer package found",
    ] },
  { at: 6500, type: "complete" },
];
