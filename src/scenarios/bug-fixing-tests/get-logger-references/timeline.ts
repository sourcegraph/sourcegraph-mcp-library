import type { TimelineEvent } from "../../../types/scenario";
import skillMdUrl from "./SKILL.md?url";

export const withoutMCP: TimelineEvent[] = [
  {
    at: 0,
    type: "assistant",
    text: "I will search across the code for implementations of the get_logger function.",
    stream: true,
  },
  {
    at: 900,
    type: "tool",
    id: "grep1",
    name: "Bash",
    args: '{ command: "grep -rn \\"get_logger\\" --include=\\"*.py\\" .", description: "Find all get_logger references" }',
    status: "running",
  },
  {
    at: 1700,
    type: "tool",
    id: "grep1",
    name: "Bash",
    args: '{ command: "grep -rn \\"get_logger\\" --include=\\"*.py\\" .", description: "Find all get_logger references" }',
    status: "done",
  },
  {
    at: 2500,
    type: "assistant",
    text: "\n Here is a list of all `get_logger` references:\n\n- service.py:12 — from core_logger import get_logger\n- service.py:16 — logger = get_logger(\"payment-service\")\n- lifecycle.py:14 — from core_logger import get_logger\n- lifecycle.py:29 — logger = get_logger(\"lifecycle\")\n- lifecycle.py:40 — logger = get_logger(service_logger_name)",
    stream: true,
  },
  { at: 5200, type: "complete" },
];

export const withMCP: TimelineEvent[] = [
  {
    at: 0,
    type: "assistant",
    text: "I will search across the code for implementations of the get_logger function.",
    stream: true,
  },
  {
    at: 460,
    type: "assistant",
    text: "I'll use the sourcegraph-nav skill for this task.",
    stream: true,
  },
  {
    at: 920,
    type: "tool",
    id: "skill1",
    name: "Skill",
    args: '{ skill: "sourcegraph-nav", args: "find all references to get_logger" }',
    status: "running",
  },
  {
    at: 1380,
    type: "tool",
    id: "skill1",
    name: "Skill",
    args: `{ skill: "sourcegraph-nav", args: "find all references to get_logger", url: "${skillMdUrl}" }`,
    status: "done",
  },
  {
    at: 1840,
    type: "assistant",
    text: "I have a reference site already (service.py:16). Let me find the definition first, then all references.",
    stream: true,
  },
  {
    at: 2300,
    type: "tool",
    id: "gtd1",
    name: "sg_go_to_definition",
    args: '{ repo: "github.com/sg-distributed-systems/payment-service", path: "src/payment_service/service.py", symbol: "get_logger" }',
    status: "running",
  },
  {
    at: 2760,
    type: "tool",
    id: "gtd1",
    name: "sg_go_to_definition",
    args: '{ repo: "github.com/sg-distributed-systems/payment-service", path: "src/payment_service/service.py", symbol: "get_logger", url: "https://demo.sourcegraph.com/r/github.com/sg-distributed-systems/payment-service@main/-/blob/src/payment_service/service.py?L16" }',
    status: "done",
  },
  {
    at: 3220,
    type: "assistant",
    text: "`get_logger` is defined in **core-logger** (`src/core_logger/factory.py:12`). Let me find all references anchored at the definition site.",
    stream: true,
  },
  {
    at: 3680,
    type: "tool",
    id: "fr1",
    name: "sg_find_references",
    args: '{ repo: "github.com/sg-distributed-systems/core-logger", path: "src/core_logger/factory.py", symbol: "get_logger", limit: 150 }',
    status: "running",
  },
  {
    at: 4140,
    type: "tool",
    id: "fr1",
    name: "sg_find_references",
    args: '{ repo: "github.com/sg-distributed-systems/core-logger", path: "src/core_logger/factory.py", symbol: "get_logger", limit: 150, url: "https://demo.sourcegraph.com/r/github.com/sg-distributed-systems/core-logger/-/blob/src/core_logger/factory.py?L11-13" }',
    status: "done",
  },
  {
    at: 4600,
    type: "assistant",
    text: "`get_logger` is  used across all services in the `sg-distributed-systems` org. Here is every file and line where it's referenced.\n\n## Definition\n- core-logger — `src/core_logger/factory.py:12` (definition)\n- core-logger — `src/core_logger/__init__.py:7`, `:11` (re-export)",
    stream: true,
  },
  {
    at: 5060,
    type: "assistant",
    text: "## References (imports + call sites)\nEvery service follows the same pattern: a `lifecycle.py` (import + 2 calls) and a `service.py` (import + 1 module-level call).",
    stream: true,
  },
  {
    at: 5520,
    type: "assistant",
    text: "| Repo | File | Import | Call sites |\n|------|------|--------|-----------|\n| analytics-service | `src/analytics_service/lifecycle.py` | L14 | L29, L40 |\n| analytics-service | `src/analytics_service/service.py` | L11 | L15 |\n| api-gateway | `src/api_gateway/lifecycle.py` | L14 | L29, L40 |\n| api-gateway | `src/api_gateway/service.py` | L11 | L15 |\n| auth-service | `src/auth_service/lifecycle.py` | L14 | L29, L40 |\n| auth-service | `src/auth_service/service.py` | L12 | L16 |\n| inventory-service | `src/inventory_service/lifecycle.py` | L14 | L29, L40 |\n| inventory-service | `src/inventory_service/service.py` | L10 | L14 |\n| notification-service | `src/notification_service/lifecycle.py` | L14 | L29, L40 |\n| notification-service | `src/notification_service/service.py` | L10 | L14 |\n| order-service | `src/order_service/lifecycle.py` | L14 | L29, L40 |\n| order-service | `src/order_service/service.py` | L13 | L18 |\n| **payment-service** | `src/payment_service/lifecycle.py` | L14 | L29, L40 |\n| **payment-service** | `src/payment_service/service.py` | L12 | **L16** (your selection) |\n| search-service | `src/search_service/lifecycle.py` | L14 | L29, L40 |\n| search-service | `src/search_service/service.py` | L11 | L16 |\n| user-service | `src/user_service/lifecycle.py` | L14 | L29, L40 |\n| user-service | `src/user_service/service.py` | L10 | L14 |\n| worker-service | `src/worker_service/lifecycle.py` | L14 | L29, L40 |\n| worker-service | `src/worker_service/service.py` | L10 | L14 |",
    stream: false,
  },
  {
    at: 5980,
    type: "assistant",
    text: "### Relevance to your bug\nThe `method=payment_method` rename would surface wherever a logger emits that field. `get_logger` only binds the service name; the broken `method`/`payment_method` key is passed at individual log statements in `service.py`, not in `get_logger` itself.",
    stream: true,
  },
  { at: 6440, type: "complete" },
];
