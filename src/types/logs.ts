// ─── Core log schema (mirrors real MongoDB structure) ─────────────────────────

export type LogLevel = "info" | "success" | "warning" | "error";

export type LogCategory =
  | "auth"
  | "members"
  | "workspace"
  | "query"
  | "sync"
  | "file"
  | "api"
  | "guardrails"
  | "settings";

export interface LogActor {
  user_id: string;
  user_name: string;
  tenant_id: string;
  tenant_name: string;
}

export interface LogTenant {
  tenant_id: string;
  tenant_name: string;
}

export interface LogEntry {
  _id: string;
  event_type: string;
  workspace_id?: string;
  workspace_name?: string;
  actor: LogActor;
  tenant: LogTenant;
  occurred_at: string; // ISO date string
  details: Record<string, string | number | boolean>;
  level: LogLevel;
  isNew?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatEventType = (et: string) =>
  et.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const deriveCategory = (event_type: string): LogCategory => {
  if (event_type.startsWith("login") || event_type.startsWith("logout") || event_type.startsWith("session")) return "auth";
  if (event_type.startsWith("member_")) return "members";
  if (event_type.startsWith("workspace_")) return "workspace";
  if (event_type.startsWith("query_")) return "query";
  if (event_type.startsWith("sync_")) return "sync";
  if (event_type.startsWith("file_")) return "file";
  if (event_type.startsWith("api_key_")) return "api";
  if (event_type.startsWith("guardrail_")) return "guardrails";
  return "settings";
};

export const deriveLevel = (event_type: string): LogLevel => {
  if (event_type.includes("failed") || event_type.includes("error") || event_type.includes("blocked")) return "error";
  if (event_type.includes("warning") || event_type.includes("throttled") || event_type.includes("removed") || event_type.includes("deleted") || event_type.includes("expired")) return "warning";
  if (event_type.includes("created") || event_type.includes("added") || event_type.includes("completed") || event_type.includes("uploaded") || event_type.includes("success") || event_type.includes("rotated") || event_type.includes("connected")) return "success";
  return "info";
};

export const categoryLabels: Record<LogCategory, string> = {
  auth: "Auth",
  members: "Members",
  workspace: "Workspace",
  query: "Query",
  sync: "Sync",
  file: "File",
  api: "API",
  guardrails: "Guardrails",
  settings: "Settings",
};

export const ALL_CATEGORIES: LogCategory[] = [
  "auth", "members", "workspace", "query", "sync", "file", "api", "guardrails", "settings",
];
