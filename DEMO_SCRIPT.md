# Sourcegraph MCP Demo Script

Presenter guide for the dual-agent demo UI (`npm run dev`). Each scenario runs side-by-side: **Without MCP** (local tools only) vs **With Sourcegraph MCP**.

## UI tips for the presenter

- Press `1`–`6` to jump scenarios; press the same key again to replay
- Use demo tabs when a scenario has multiple prompts
- After playback completes, expand **Quality Breakdown** and point at the metrics bar (time, cost, quality, tool calls)
- **Download log** links prove the runs are real

---

## Part 0 — Opening: Why Sourcegraph MCP (~3 min)

### TELL — Set the problem

> "Every team is adopting AI coding agents — Cursor, Claude Code, Copilot, custom agents. The model is rarely the bottleneck anymore. **Context is.**"

> "Agents today explore codebases by grepping, reading files one at a time, and guessing. That works on small repos you have fully checked out. It breaks down when:
> - The codebase is large or unfamiliar
> - You only have a partial clone
> - Logic spans multiple repos or services
> - You need precision — security audits, incident triage, architecture comprehension"

> "Wrong context doesn't just waste tokens. It produces **confident wrong answers** — the most expensive kind of failure."

### TELL — The differentiator

> "**Sourcegraph MCP gives agents structured access to your entire codebase** — semantic search, cross-repo navigation, and targeted file reads — without stuffing the whole repo into the context window."

> "Three outcomes we see consistently:
> 1. **Better results** — agents find the right files, trace the right call chains, and give answers grounded in how the code actually works
> 2. **Lower token spend** — fewer blind reads, fewer redundant tool calls, less noise in the context window
> 3. **Faster task completion** — less wandering, more direct paths to the answer"

### SHOW — The demo UI

> "This app replays real agent runs — same prompt, same model, two different context sources. Left: local tools only. Right: Sourcegraph MCP. Watch the tool-call density, then the quality breakdown at the end."

### TELL — Transition

> "We'll walk through six everyday engineering tasks. Each one shows where better context changes the outcome — not just the speed."

---

## Scenario 1 — Understanding Existing Code

**Press `1`** | Repos: ADS microservices, Apache Flink

This scenario has three sub-demos. Lead with **Architecture comprehension** (Flink), then optionally show **Multi-repo business logic (ADS)**.

### Demo 1A: Flink checkpoint architecture (flagship)

**Tab:** Architecture comprehension | **Repo:** `apache/flink`

#### TELL — The scenario

> "You're onboarding onto Apache Flink — a large open-source codebase. The ask is architectural: map how checkpoint coordination works end-to-end — JobManager triggers, barrier propagation, operator snapshots, acknowledgments."

> "This is exactly the kind of question where an agent without good context **reads a lot** but **understands little**."

#### SHOW — Run the demo

> "Watch the left column first."

**Call out on Without MCP:**

- Tool-call counter climbing — **104 tool calls**
- Scattered file reads across 19+ files, many irrelevant
- Long runtime (~13+ min) and high cost (~$3)

> "It explored extensively but never synthesized a coherent architecture. File recall scored zero — it didn't land on the ground-truth files."

**Call out on With MCP:**

- **44 tool calls** — less than half
- Systematic discovery of the 15 key files
- Methodical call-chain tracing in the correct order
- ~57% faster, ~36% cheaper

**Expand Quality Breakdown:**

- Task quality: baseline 0.40 → MCP 1.0
- File recall: 0.00 → 0.80
- Composite: **0.16 → 0.81** (~5× better)

#### TELL — The takeaway

> "Same model, same prompt. The difference is **context quality**. MCP didn't read less because it got lucky — it read **smarter**. Semantic search pointed at the coordination layer instead of random checkpoint-adjacent files."

> "For onboarding and architecture questions, that's the difference between a 975-line dump of exploration notes and an actual answer you can trust."

### Demo 1B: ADS multi-repo business logic (optional)

**Tab:** Multi-repo business logic (ADS)

#### TELL

> "Now imagine you just joined the NASA Astrophysics Data System team. You need to understand auth, anonymous vs authenticated users, rate limiting, and saved searches — across a **microservice architecture**, but you only have one legacy repo checked out locally."

#### SHOW

**Without MCP:** Answers coherently from the **legacy monolith** — classic ADS + MongoDB, capability tiers confused with rate limits. Quality **0.22**.

**With MCP:** Traces **6 repos** — adsws, api_gateway, vault, biblib-service, nectar, solr-service. Correct OAuth flow, flask-limiter + Redis, vault vs biblib-service for libraries. Quality **0.93**.

#### TELL

> "Without MCP, the agent gave a plausible onboarding doc for the **wrong architecture**. With MCP, it mapped production reality across repos you don't even have cloned."

---

## Scenario 2 — Code Reuse & Consistency

**Press `2`** | **Repo:** `grafana/grafana` | **Tab:** Tracer injection consistency

#### TELL

> "Consistency audits are deceptively hard. Grafana's preferred pattern is injecting a tracer via the service struct — but many files still use a package-level global `var tracer = otel.Tracer(...)`."

> "The prompt asks for a full inventory, a canonical example, mixed-pattern detection, and migration prioritization. Sounds like a grep job — until you realize subtle variants exist."

#### SHOW

**Without MCP:**

- Strong on the obvious pattern — **29 files**, full path list, migration snippet
- Misses `setting/service.go` — a wrapped global tracer
- Output garbled mid-stream in places

**With MCP:**

- Finds **30 files** including the wrapped-global variant
- Stronger end-to-end service example (cloudmigration/s3.go)
- Surfaces the migration edge case baseline's grep would miss
- **6 tool calls vs 9**, faster completion

**Quality Breakdown:** 0.78 → 0.84 — MCP wins on completeness and nuance

#### TELL

> "This is a subtle scenario — baseline wasn't terrible because the repo was fully local. MCP still found what grep missed and did it with fewer tool calls."

> "For consistency work at scale — across packages, languages, or repos — structured search beats filename globbing every time."

---

## Scenario 3 — Feature Development

**Press `3`** | Two sub-demos: VS Code clipboard API, FastAPI rate limiting

### Demo 3A: Clipboard history extension API (flagship)

**Tab:** Clipboard history extension API | **Repo:** `microsoft/vscode`

#### TELL

> "You're planning a new VS Code extension API for clipboard history. The agent needs to trace the full pattern: `vscode.d.ts` declaration → main process → IPC bridge."

> "Here's the catch: the local checkout is a **partial clone** — extensions only, no `src/` core. This mirrors real enterprise setups: sparse checkouts, monorepo subpaths, CI sandboxes."

#### SHOW

**Without MCP:**

- **144 tool calls**, two explore subagents (66 + 70 uses)
- Stays in `extensions/` — never reads local `src/`
- Reverse-engineers from a Copilot test fixture (`extHost.api.impl.ts`)
- Produces a detailed 5-layer architecture write-up, but paths are inferred upstream references — not files it actually read locally
- Assumes OS-level clipboard history exists (includes a macOS System Settings verification step)
- Proposes speculative `IClipboardService.readHistory?()` with single-item fallback
- Quality **0.38**

**With MCP:**

- **50 tool calls** total (144 → 50, ~65% fewer) — not just search-and-read; two explore subagents also ran (10 + 32 uses), but far less thrashing overall
- Two Deep Search queries + three targeted upstream reads via MCP
- Pulls real indexed files from `github.com/microsoft/vscode`: `mainThreadClipboard.ts`, `NativeClipboardService`, `BrowserClipboardService`
- Designs a ring buffer fed by `onDidWriteText` — grounded in actual write path
- Correctly scopes: VS Code–mediated writes only, not native OS clipboard changes from other apps
- Quality **0.94**, ~34% lower cost ($1.82 → $1.21); time only modestly faster (9m 23s → 8m 1s) — the win here is quality + cost + tool efficiency

> **Methodology note:** The MCP run's prompt includes "Use Sourcegraph Deep Search." Mention this if asked about apples-to-apples fairness.

#### TELL

> "Baseline wrote a plan that **looked** professional but was anchored to one test fixture and an API that doesn't exist. MCP read the real upstream source and got both the mechanism and its limitations right."

> "Feature planning without full repo access is where MCP pays for itself immediately."

### Demo 3B: FastAPI RateLimiter dependency (optional)

**Tab:** Built-in RateLimiter dependency | **Repo:** `tiangolo/fastapi`

#### TELL

> "Same planning task, different repo: design a built-in RateLimiter dependency. The prompt explicitly asks about middleware vs DI interaction and client IP handling behind reverse proxies."

#### SHOW

**Without MCP:** 110 tool calls, three explore subagents. Partial middleware analysis, `request.client.host` only. Quality **0.59**.

**With MCP:** 12 tool calls. Full middleware-vs-dependency comparison, X-Forwarded-For handling, line-level DI internals (`solve_dependencies()`). Quality **0.92**, ~50% lower cost.

#### TELL

> "MCP answered all three pillars of the prompt with an order-of-magnitude fewer tool calls. That's token savings you can measure on every planning session."

---

## Scenario 4 — Bug Fixing & Tests


 **Note:** This scenario currently has a placeholder sub-demo 

---

## Scenario 5 — Investigating an Incident

**Press `5`** | **Tab:** V38 fieldConfig migration drop | **Repo:** `grafana/grafana`

#### TELL

> "Production incident: Grafana's v38 dashboard migration silently drops `fieldConfig.defaults.custom` during import. The on-call engineer needs the exact Go files, the merge function, and the schema version constant — fast."

> "Incidents punish plausible wrong answers. Both sides finish in under 90 seconds here. The risk isn't 'no answer' — it's **the wrong answer delivered confidently**."

#### SHOW

**Without MCP (~48s, $0.09):**

- Blames defaults migration (`cleanupFieldConfigDefaults`) — wrong path
- Vague language: "appears to be", "may not preserve"
- No proposed fix
- Pulls in tangential files like `frontend_defaults.go`
- Quality **0.45**

**With MCP (~78s, $0.08):**

- Identifies `migrateOverrides()` skipped when `defaults.custom` absent
- Names `processPanelsV38()` line 131, full call chain
- Proposes concrete fix: decouple defaults from overrides migration
- Matches upstream fix commit `26d36ec`
- Quality **0.95**, 17% lower cost despite 30s longer

**Expand Quality Breakdown** — highlight "Root cause accuracy" and "Proposed fix" rows

#### TELL

> "Baseline was faster and cheaper — and **wrong**. MCP took 30 extra seconds and saved the engineer hours of debugging the wrong code path."

> "For incident response, Sourcegraph MCP is insurance against confident misdiagnosis."

---

## Scenario 6 — Security

**Press `6`** | **Tab:** ACL authorization code audit | **Repo:** `apache/kafka`

#### TELL

> "Security audits need completeness, not plausibility. The prompt: find every Java file in Kafka that implements or defines ACL authorization logic, and classify each — interface, implementation, or utility."

> "Filename globbing feels sufficient until you realize KRaft moved authorizer code into `metadata/` — outside the directories a `find` under `clients/` would ever reach."

#### SHOW

**Without MCP:**

- **`find -name '*Authorizer*.java'`** under `clients/` and `core/` only
- **483 tool calls** — scattered bash/grep
- Found 21/25 files (84%) — missed StandardAuthorizer, ClusterMetadataAuthorizer, AclCache, AclMutator
- Flat file list, no directory grouping
- Quality **0.00** — failed the audit

**With MCP:**

- Semantic + structural search: `sg_keyword_search`, `sg_nls_search`, `sg_list_files`
- **42 tool calls** — ~11× fewer
- **25/25 files (100%)** across all 4 authorizer directories
- Grouped output: ACL data model, Authorizer interface, server security, KRaft authorizer package
- Quality **1.00**

#### TELL

> "This is the clearest token-savings story in the deck: **483 tool calls down to 42**, failed audit to passing audit."

> "For security and compliance work, incomplete coverage isn't a partial win — it's a fail. MCP finds what globbing misses."

---

## Closing (~1 min)

### TELL

> "Six different tasks — onboarding, consistency, feature planning, bug fixing, incidents, security. The pattern repeats:"

| Outcome | What MCP changes |
|--------|------------------|
| **Better context** | Right files, right repos, right call chains — not just more files |
| **Better outcomes** | Higher quality scores; fewer confident wrong answers |
| **Token savings** | Fewer redundant reads and explore loops (Flink: 104→44, Kafka: 483→42, VS Code: 144→50) |
| **Faster completion** | Less wandering, especially on large or partial repos |

> "Sourcegraph MCP doesn't replace your agent. It gives your agent **eyes on the whole codebase** — so every token spent is working toward the right answer."

> "Questions? We can replay any scenario, download the raw logs, or walk through connecting MCP to your agent setup."

---

## Quick reference — which demo to lead with

| Key | Scenario | Lead demo | Headline stat |
|-----|----------|-----------|---------------|
| `1` | Understanding code | Flink checkpoint arch | 5× quality, 104→44 tool calls |
| `2` | Code reuse | Tracer consistency | +1 hidden variant, fewer calls |
| `3` | Feature development | Clipboard history API | 0.38→0.94 quality, 144→50 tool calls |
| `4` | Bug fixing | *(placeholder — WIP)* | ~64% time savings (preview) |
| `5` | Incident | V38 fieldConfig drop | Wrong answer fast vs right answer |
| `6` | Security | Kafka ACL audit | 483→42 tool calls, 0→1.0 quality |
