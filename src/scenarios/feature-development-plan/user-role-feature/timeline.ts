import type { TimelineEvent } from "../../../types/scenario";

export const withoutMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "Add a Role field to the User model and wire it through auth, API, and the admin UI." },
  { at: 800, type: "assistant", text: "I'll add a Role field to the User struct and update the store methods.", stream: true },
  { at: 2000, type: "tool", name: "read_file", args: "{ path: \"internal/database/user.go\" }", status: "done" },
  { at: 2800, type: "assistant", text: "Done! I've added:\n• Role field to User struct\n• Updated Create/Update to persist role\n• GetByRole query method\n\nYou'll want to add a migration and update auth checks.", stream: true },
  { at: 5500, type: "missed", items: [
      "Auth middleware — no role check on admin routes",
      "API response DTO — role never returned to clients",
      "Audit logging — role changes not tracked",
      "/admin frontend routes — no guard",
      "Invite flow — default role not set",
      "4 integration tests — will break",
    ] },
  { at: 6000, type: "complete" },
];




export const withMCP: TimelineEvent[] = [
  { at: 0, type: "user", text: "Add a Role field to the User model and wire it through auth, API, and the admin UI." },
  { at: 500, type: "tool", name: "keyword_search", args: "{ query: \"User struct\" }", status: "running" },
  { at: 1000, type: "tool", name: "keyword_search", args: "{ query: \"User struct\" }", status: "done" },
  { at: 1500, type: "tool", name: "deep_search", args: "{ query: \"Where is user authorization enforced for admin?\" }", status: "running" },
  { at: 2800, type: "tool", name: "deep_search", args: "{ query: \"Where is user authorization enforced for admin?\" }", status: "done" },
  { at: 3300, type: "assistant", text: "Found 31 files referencing User across 7 layers. This is a cross-cutting change. Plan:\n\n1. DB migration\n2. Model\n3. Auth middleware\n4. API DTO\n5. Audit logging\n6. Invite flow\n7. Frontend guards\n8. Integration tests", stream: true },
  { at: 6000, type: "tool", name: "read_file", args: "{ path: \"middleware/auth.go\" }", status: "done" },
  { at: 6800, type: "assistant", text: "Ready to edit 12 files across 7 layers. Full diff prepared for review.", stream: true },
  { at: 8000, type: "missed", items: [
      "Auth middleware — role checks added",
      "API response DTO — role exposed",
      "Audit logging — changes tracked",
      "/admin frontend routes — guarded",
      "Invite flow — default role set",
      "Integration tests — updated",
    ] },
  { at: 8500, type: "complete" },
];
