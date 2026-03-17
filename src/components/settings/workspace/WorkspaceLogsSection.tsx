import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Search, Download, CheckCircle2, AlertTriangle, XCircle,
  Info, ChevronDown, CalendarIcon, X, Copy, Check, ExternalLink,
  Wifi, WifiOff, Pause, Play, Clock, User, Server, Zap, Hash,
  Link2, Terminal, Tag, Activity, Braces
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type LogLevel = "info" | "success" | "warning" | "error";
type LogCategory = "sync" | "auth" | "user" | "system" | "file" | "guardrail" | "query";

interface RelatedEvent {
  id: string;
  label: string;
  timestamp: string;
  level: LogLevel;
}

// MongoDB-style document structure
interface LogDocument {
  _id: { $oid: string };
  event_type: string;
  workspace_id: string;
  workspace_name: string;
  actor: {
    user_id: string;
    user_name: string;
    tenant_id: string;
    tenant_name: string;
  };
  tenant: {
    tenant_id: string;
    tenant_name: string;
  };
  occurred_at: { $date: string };
  details: Record<string, string | number | boolean>;
  __v: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: string;
  source?: string;
  duration?: string;
  user?: string;
  ip?: string;
  traceId?: string;
  stackTrace?: string;
  metadata?: Record<string, string>;
  relatedEvents?: RelatedEvent[];
  raw: LogDocument; // raw BSON-style JSON
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TENANT_ID = "784dbf7f-daf0-4b53-8b83-f6e55147463e";
const TENANT_NAME = "quadrant technologies";
const WS_ID = "67ffdbbf-ae83-4648-8138-568a9ea1c50e";

const makeOid = () => Math.random().toString(36).slice(2, 26).padEnd(24, "0");
const makeUuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

function buildRaw(
  eventType: string,
  actorName: string,
  occurredAt: string,
  details: Record<string, string | number | boolean>,
  wsName = "test"
): LogDocument {
  return {
    _id: { $oid: makeOid() },
    event_type: eventType,
    workspace_id: WS_ID,
    workspace_name: wsName,
    actor: {
      user_id: makeUuid(),
      user_name: actorName,
      tenant_id: TENANT_ID,
      tenant_name: TENANT_NAME,
    },
    tenant: { tenant_id: TENANT_ID, tenant_name: TENANT_NAME },
    occurred_at: { $date: occurredAt },
    details,
    __v: 0,
  };
}

// ─── Seed Logs ────────────────────────────────────────────────────────────────
const SEED_LOGS: LogEntry[] = [
  {
    id: "s1",
    timestamp: "2026-03-17T08:47:44.470Z",
    level: "info",
    category: "user",
    message: "Member role updated to 'member'",
    details: "anand.komati updated the role of a workspace member from 'owner' to 'member'.",
    source: "User Management",
    user: "anand.komati",
    traceId: "trace-usr-0047",
    metadata: { "Member ID": "f5e8f52a-d5e1-4d00-b094-71e281802469", "New role": "member", "Previous role": "owner", "Workspace": "test" },
    relatedEvents: [
      { id: "s2", label: "Member added to workspace", timestamp: "2026-03-17T08:10:00.000Z", level: "info" },
    ],
    raw: buildRaw("member_role_updated", "anand.komati", "2026-03-17T08:47:44.470Z", {
      member_id: "f5e8f52a-d5e1-4d00-b094-71e281802469",
      new_role: "member",
      previous_role: "owner",
    }),
  },
  {
    id: "s2",
    timestamp: "2026-03-17T08:10:00.000Z",
    level: "success",
    category: "user",
    message: "Member added to workspace",
    details: "anand.komati invited priya.sharma to the 'test' workspace with role 'member'.",
    source: "User Management",
    user: "anand.komati",
    traceId: "trace-usr-0046",
    metadata: { "Invited user": "priya.sharma", "Role": "member", "Method": "Email invite", "Workspace": "test" },
    raw: buildRaw("member_added", "anand.komati", "2026-03-17T08:10:00.000Z", {
      invited_user: "priya.sharma",
      role: "member",
      invite_method: "email",
    }),
  },
  {
    id: "s3",
    timestamp: "2026-03-17T07:55:22.000Z",
    level: "success",
    category: "file",
    message: "File uploaded: Q1_Financial_Report.pdf",
    details: "anand.komati uploaded a PDF document to the workspace. Indexing and embedding pipeline triggered automatically.",
    source: "File Storage",
    user: "anand.komati",
    duration: "1.8s",
    traceId: "trace-file-0312",
    metadata: { "File name": "Q1_Financial_Report.pdf", "File size": "2.4 MB", "Type": "pdf", "Chunks indexed": "48", "Workspace": "test" },
    relatedEvents: [
      { id: "s4", label: "File indexing completed", timestamp: "2026-03-17T07:55:35.000Z", level: "success" },
    ],
    raw: buildRaw("file_uploaded", "anand.komati", "2026-03-17T07:55:22.000Z", {
      file_name: "Q1_Financial_Report.pdf",
      file_size_bytes: 2516582,
      file_type: "pdf",
      chunks_indexed: 48,
    }),
  },
  {
    id: "s4",
    timestamp: "2026-03-17T07:55:35.000Z",
    level: "success",
    category: "file",
    message: "File indexing completed: Q1_Financial_Report.pdf",
    details: "48 chunks extracted and embedded into the vector store. File is now available for queries.",
    source: "Indexing Pipeline",
    duration: "13.2s",
    traceId: "trace-file-0312",
    metadata: { "File": "Q1_Financial_Report.pdf", "Chunks": "48", "Embedding model": "text-embedding-3-large", "Store": "pgvector" },
    raw: buildRaw("file_indexed", "system", "2026-03-17T07:55:35.000Z", {
      file_name: "Q1_Financial_Report.pdf",
      chunks: 48,
      embedding_model: "text-embedding-3-large",
    }),
  },
  {
    id: "s5",
    timestamp: "2026-03-17T07:30:10.000Z",
    level: "success",
    category: "sync",
    message: "Salesforce CRM sync completed",
    details: "Full refresh completed. All records reconciled against remote state. 1,248 total records processed.",
    source: "Salesforce CRM",
    duration: "12.4s",
    traceId: "trace-sfdc-8821",
    metadata: { "Records synced": "1,248", "Updated": "842", "New": "406", "Skipped": "0", "Connector version": "2.4.1", "Trigger": "Scheduled" },
    relatedEvents: [
      { id: "s6", label: "Salesforce sync started", timestamp: "2026-03-17T07:29:55.000Z", level: "info" },
    ],
    raw: buildRaw("datasource_sync_completed", "system", "2026-03-17T07:30:10.000Z", {
      source: "salesforce_crm",
      records_synced: 1248,
      updated: 842,
      new_records: 406,
      duration_ms: 12400,
    }),
  },
  {
    id: "s6",
    timestamp: "2026-03-17T07:29:55.000Z",
    level: "info",
    category: "sync",
    message: "Salesforce CRM sync started",
    details: "Scheduled incremental sync initiated for Salesforce CRM connector.",
    source: "Salesforce CRM",
    traceId: "trace-sfdc-8821",
    metadata: { "Trigger": "Scheduled", "Schedule": "Every 30 min", "Connector version": "2.4.1" },
    raw: buildRaw("datasource_sync_started", "system", "2026-03-17T07:29:55.000Z", {
      source: "salesforce_crm",
      trigger: "scheduled",
    }),
  },
  {
    id: "s7",
    timestamp: "2026-03-17T07:15:00.000Z",
    level: "error",
    category: "sync",
    message: "OneDrive sync failed — OAuth token expired",
    details: "The access token for OneDrive connector expired and could not be refreshed automatically. Re-authenticate under Configuration → OneDrive.",
    source: "OneDrive",
    traceId: "trace-od-0012",
    metadata: { "Connector": "OneDrive v1.2.0", "Token expiry": "2026-03-17T07:14:00Z", "Retry attempts": "3", "HTTP status": "401" },
    stackTrace: `OAuthError: Access token refresh failed
  at OAuthConnector.refreshToken (connectors/oauth.ts:88)
  at OneDriveSync.authenticate (connectors/onedrive.ts:42)
  at SyncEngine.run (engine/sync.ts:120)
  at Scheduler.tick (scheduler/index.ts:55)
Caused by: HTTPError: 401 Unauthorized — token_expired
  at fetchWithRetry (lib/http.ts:34)`,
    relatedEvents: [
      { id: "s8", label: "OneDrive sync started", timestamp: "2026-03-17T07:14:45.000Z", level: "info" },
    ],
    raw: buildRaw("datasource_sync_failed", "system", "2026-03-17T07:15:00.000Z", {
      source: "onedrive",
      error: "oauth_token_expired",
      http_status: 401,
      retry_attempts: 3,
    }),
  },
  {
    id: "s8",
    timestamp: "2026-03-17T07:14:45.000Z",
    level: "info",
    category: "sync",
    message: "OneDrive sync started",
    source: "OneDrive",
    traceId: "trace-od-0012",
    metadata: { "Trigger": "Manual", "Initiated by": "anand.komati" },
    raw: buildRaw("datasource_sync_started", "anand.komati", "2026-03-17T07:14:45.000Z", {
      source: "onedrive",
      trigger: "manual",
    }),
  },
  {
    id: "s9",
    timestamp: "2026-03-17T06:58:30.000Z",
    level: "info",
    category: "guardrail",
    message: "Guardrail policy updated",
    details: "anand.komati updated the workspace system prompt and topic restriction rules. Policy version incremented to v5.",
    source: "Guardrails",
    user: "anand.komati",
    traceId: "trace-grd-0081",
    metadata: { "Changed by": "anand.komati", "Policy version": "v5", "Previous version": "v4", "Rules affected": "3" },
    raw: buildRaw("guardrail_policy_updated", "anand.komati", "2026-03-17T06:58:30.000Z", {
      policy_version: "v5",
      previous_version: "v4",
      rules_changed: 3,
    }),
  },
  {
    id: "s10",
    timestamp: "2026-03-17T06:45:12.000Z",
    level: "success",
    category: "query",
    message: "AI query answered with 6 sources",
    details: "Query: 'What were Q1 revenue drivers?' — 6 document chunks retrieved across 3 data sources and answered by the model.",
    source: "Query Engine",
    duration: "3.1s",
    user: "priya.sharma",
    traceId: "trace-qry-2201",
    metadata: { "Chunks retrieved": "6", "Sources used": "3", "Model": "gpt-4o", "Tokens in": "1,840", "Tokens out": "512", "Workspace": "test" },
    raw: buildRaw("query_answered", "priya.sharma", "2026-03-17T06:45:12.000Z", {
      chunks_retrieved: 6,
      sources_used: 3,
      model: "gpt-4o",
      tokens_in: 1840,
      tokens_out: 512,
      duration_ms: 3100,
    }),
  },
  {
    id: "s11",
    timestamp: "2026-03-17T06:30:00.000Z",
    level: "warning",
    category: "query",
    message: "Slow query detected on Snowflake data source",
    details: "Query execution exceeded the 15s threshold. 2.4M rows scanned. Consider adding a covering index or narrowing date range filters.",
    source: "Snowflake Analytics",
    duration: "18.2s",
    user: "priya.sharma",
    traceId: "trace-qry-3310",
    metadata: { "Query hash": "a3f9d821", "Rows scanned": "2.4M", "Rows returned": "1,240", "Warehouse": "COMPUTE_WH", "Threshold": "15s" },
    raw: buildRaw("query_slow", "priya.sharma", "2026-03-17T06:30:00.000Z", {
      query_hash: "a3f9d821",
      rows_scanned: 2400000,
      rows_returned: 1240,
      duration_ms: 18200,
      threshold_ms: 15000,
    }),
  },
  {
    id: "s12",
    timestamp: "2026-03-17T06:15:44.000Z",
    level: "success",
    category: "auth",
    message: "SSO authentication successful",
    details: "anand.komati authenticated via SAML 2.0 SSO through Okta. Session established with 8h TTL.",
    source: "Auth",
    user: "anand.komati",
    ip: "203.0.113.55",
    duration: "0.3s",
    metadata: { "Method": "SAML 2.0", "IdP": "Okta", "Session TTL": "8h", "MFA": "Passed", "IP": "203.0.113.55" },
    raw: buildRaw("user_login_success", "anand.komati", "2026-03-17T06:15:44.000Z", {
      auth_method: "saml_sso",
      idp: "okta",
      mfa_passed: true,
      ip_address: "203.0.113.55",
      session_ttl_hours: 8,
    }),
  },
  {
    id: "s13",
    timestamp: "2026-03-17T06:00:05.000Z",
    level: "warning",
    category: "auth",
    message: "Multiple failed login attempts detected",
    details: "3 consecutive failed authentication attempts from the same IP. Account temporarily throttled for 5 minutes.",
    source: "Auth",
    ip: "192.168.1.104",
    user: "ravi.menon",
    metadata: { "Attempts": "3", "Throttle duration": "5 min", "IP": "192.168.1.104", "Auth method": "Password" },
    stackTrace: `AuthError: Max retry attempts exceeded
  at AuthMiddleware.validateCredentials (auth/middleware.ts:77)
  at AuthController.login (auth/controller.ts:33)
  at Router.handle (router/index.ts:102)`,
    raw: buildRaw("login_failed_throttled", "ravi.menon", "2026-03-17T06:00:05.000Z", {
      attempts: 3,
      throttle_minutes: 5,
      ip_address: "192.168.1.104",
      auth_method: "password",
    }),
  },
  {
    id: "s14",
    timestamp: "2026-03-17T05:45:20.000Z",
    level: "info",
    category: "file",
    message: "File deleted: Old_Contracts_2024.xlsx",
    details: "anand.komati permanently deleted a spreadsheet file from the workspace.",
    source: "File Storage",
    user: "anand.komati",
    metadata: { "File name": "Old_Contracts_2024.xlsx", "File size": "540 KB", "Type": "excel", "Workspace": "test" },
    raw: buildRaw("file_deleted", "anand.komati", "2026-03-17T05:45:20.000Z", {
      file_name: "Old_Contracts_2024.xlsx",
      file_size_bytes: 552960,
      file_type: "excel",
    }),
  },
  {
    id: "s15",
    timestamp: "2026-03-17T05:30:00.000Z",
    level: "error",
    category: "sync",
    message: "ServiceNow connector returned 403 Forbidden",
    details: "The configured API key lacks read access to the 'incidents' table. Update permissions in your ServiceNow instance.",
    source: "ServiceNow",
    traceId: "trace-sn-9933",
    metadata: { "HTTP status": "403", "Endpoint": "/api/now/table/incident", "API key": "sn_key_***redacted***", "Table": "incident" },
    stackTrace: `HTTPError: 403 Forbidden
  at ServiceNowConnector.fetchPage (connectors/servicenow.ts:66)
  at ServiceNowSync.syncTable (connectors/servicenow.ts:112)
  at SyncEngine.run (engine/sync.ts:120)
  at Scheduler.tick (scheduler/index.ts:55)`,
    relatedEvents: [
      { id: "s16", label: "ServiceNow sync started", timestamp: "2026-03-17T05:29:40.000Z", level: "info" },
    ],
    raw: buildRaw("datasource_sync_failed", "system", "2026-03-17T05:30:00.000Z", {
      source: "servicenow",
      error: "http_403_forbidden",
      endpoint: "/api/now/table/incident",
    }),
  },
  {
    id: "s16",
    timestamp: "2026-03-17T05:29:40.000Z",
    level: "info",
    category: "sync",
    message: "ServiceNow sync started",
    source: "ServiceNow",
    traceId: "trace-sn-9933",
    metadata: { "Trigger": "Scheduled", "Tables": "incidents, changes, problems" },
    raw: buildRaw("datasource_sync_started", "system", "2026-03-17T05:29:40.000Z", {
      source: "servicenow",
      trigger: "scheduled",
      tables: "incidents,changes,problems",
    }),
  },
  {
    id: "s17",
    timestamp: "2026-03-17T05:00:00.000Z",
    level: "info",
    category: "system",
    message: "Workspace created: 'test'",
    details: "anand.komati created a new shared workspace named 'test' under quadrant technologies.",
    source: "Workspace",
    user: "anand.komati",
    traceId: "trace-ws-0001",
    metadata: { "Workspace ID": WS_ID, "Type": "shared", "Created by": "anand.komati", "Tenant": TENANT_NAME },
    raw: buildRaw("workspace_created", "anand.komati", "2026-03-17T05:00:00.000Z", {
      workspace_type: "shared",
      workspace_name: "test",
    }),
  },
];

// ─── Streaming Templates ───────────────────────────────────────────────────────
const STREAM_TEMPLATES: Omit<LogEntry, "id" | "timestamp" | "raw">[] = [
  {
    level: "info", category: "sync", message: "Snowflake incremental sync started",
    source: "Snowflake Analytics", metadata: { "Trigger": "Scheduled", "Mode": "Incremental" },
  },
  {
    level: "success", category: "query", message: "AI query answered with 4 sources",
    source: "Query Engine", duration: "2.7s",
    metadata: { "Chunks retrieved": "4", "Model": "gpt-4o", "Tokens in": "1,100", "Tokens out": "380" },
    user: "priya.sharma",
  },
  {
    level: "success", category: "file", message: "File uploaded: Product_Roadmap_2026.pptx",
    source: "File Storage", duration: "1.2s",
    metadata: { "File name": "Product_Roadmap_2026.pptx", "File size": "3.1 MB", "Type": "powerpoint", "Chunks indexed": "62" },
    user: "anand.komati",
  },
  {
    level: "warning", category: "system", message: "Workspace storage nearing 80% capacity",
    source: "System", details: "Consider removing unused documents or upgrading your plan.",
    metadata: { "Used": "8.1 GB", "Limit": "10 GB", "Usage": "81%" },
  },
  {
    level: "success", category: "sync", message: "Google Drive sync completed",
    source: "Google Drive", duration: "4.8s",
    metadata: { "Files synced": "312", "Updated": "78", "New": "234", "Removed": "0" },
  },
  {
    level: "info", category: "auth", message: "OAuth token refreshed for Salesforce CRM",
    source: "Auth", metadata: { "Connector": "Salesforce CRM", "Token TTL": "1h" },
  },
  {
    level: "info", category: "user", message: "Member role updated to 'owner'",
    source: "User Management", user: "anand.komati",
    metadata: { "New role": "owner", "Previous role": "member", "Workspace": "test" },
  },
  {
    level: "error", category: "query", message: "Query failed — context window exceeded",
    source: "Query Engine", details: "Retrieved context exceeded model token limit. Narrow search filters.",
    metadata: { "Tokens in": "128,100", "Limit": "128,000", "Model": "gpt-4o" },
    stackTrace: `ContextWindowError: Input exceeds maximum token limit
  at ContextBuilder.build (engine/context.ts:212)
  at QueryEngine.answer (engine/query.ts:88)
  at APIHandler.query (api/handlers.ts:45)`,
  },
  {
    level: "info", category: "guardrail", message: "Guardrail rule added: PII redaction",
    source: "Guardrails", user: "anand.komati",
    metadata: { "Rule type": "REDACT", "Pattern": "email, phone, SSN", "Policy version": "v6" },
  },
  {
    level: "success", category: "file", message: "File indexing completed: Annual_Review_2025.pdf",
    source: "Indexing Pipeline", duration: "9.6s",
    metadata: { "File": "Annual_Review_2025.pdf", "Chunks": "34", "Embedding model": "text-embedding-3-large" },
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const levelConfig: Record<LogLevel, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badgeClass: string;
  textClass: string;
}> = {
  success: { icon: CheckCircle2, label: "Success", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", textClass: "text-emerald-600" },
  info:    { icon: Info,          label: "Info",    badgeClass: "bg-primary/10 text-primary border-primary/20",                 textClass: "text-primary"   },
  warning: { icon: AlertTriangle, label: "Warning", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",           textClass: "text-amber-600" },
  error:   { icon: XCircle,       label: "Error",   badgeClass: "bg-destructive/10 text-destructive border-destructive/20",     textClass: "text-destructive" },
};

const categoryLabels: Record<LogCategory, string> = {
  sync: "Sync", auth: "Auth", user: "User", system: "System",
  file: "File", guardrail: "Guardrail", query: "Query",
};

const ALL_LEVELS: LogLevel[]      = ["info", "success", "warning", "error"];
const ALL_CATEGORIES: LogCategory[] = ["sync", "auth", "user", "system", "file", "guardrail", "query"];

const formatTs    = (iso: string) => format(parseISO(iso), "MMM d, yyyy  HH:mm:ss");
const formatShort = (iso: string) => format(parseISO(iso), "HH:mm:ss");

let streamCounter = 0;
const makeStreamEntry = (): LogEntry => {
  const tpl = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)];
  streamCounter++;
  const now = new Date().toISOString();
  return {
    ...tpl,
    id: `live-${Date.now()}-${streamCounter}`,
    timestamp: now,
    traceId: `trace-live-${String(streamCounter).padStart(4, "0")}`,
    raw: buildRaw(
      tpl.category + "_event",
      tpl.user ?? "system",
      now,
      Object.fromEntries(Object.entries(tpl.metadata ?? {}).map(([k, v]) => [k.toLowerCase().replace(/ /g, "_"), v]))
    ),
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const MetaRow = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
    <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
    <span className="text-xs text-foreground font-mono break-all">{value}</span>
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-accent transition-colors" title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );
};

// ─── JSON Syntax Highlighter ──────────────────────────────────────────────────
const JsonHighlight = ({ data }: { data: object }) => {
  const json = JSON.stringify(data, null, 2);
  // Simple token coloring
  const highlighted = json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = "text-sky-400"; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) cls = "text-violet-400"; // key
        else cls = "text-emerald-400"; // string value
      } else if (/true|false/.test(match)) {
        cls = "text-amber-400";
      } else if (/null/.test(match)) {
        cls = "text-rose-400";
      }
      return `<span class="${cls}">${match}</span>`;
    });
  return (
    <pre
      className="text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────
const LogDetailDrawer = ({
  log, open, onClose, onSelectRelated,
}: {
  log: LogEntry | null;
  open: boolean;
  onClose: () => void;
  onSelectRelated: (id: string) => void;
}) => {
  if (!log) return null;
  const cfg  = levelConfig[log.level];
  const Icon = cfg.icon;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0 gap-0">
        <SheetHeader className="px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3 pr-6">
            <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", cfg.textClass)} />
            <div className="space-y-1 flex-1 min-w-0">
              <SheetTitle className="text-sm font-semibold leading-snug text-foreground">
                {log.message}
              </SheetTitle>
              <div className="flex items-center flex-wrap gap-2">
                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 leading-5 font-medium", cfg.badgeClass)}>
                  {cfg.label}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-5 text-muted-foreground">
                  {categoryLabels[log.category]}
                </Badge>
                {log.source && <span className="text-[11px] text-muted-foreground">{log.source}</span>}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="structured" className="flex flex-col flex-1 min-h-0">
          <div className="px-5 pt-3 pb-0 border-b border-border shrink-0">
            <TabsList className="h-8 bg-muted/50">
              <TabsTrigger value="structured" className="text-xs h-6 px-3 gap-1.5">
                <Activity className="w-3 h-3" />
                Structured
              </TabsTrigger>
              <TabsTrigger value="json" className="text-xs h-6 px-3 gap-1.5">
                <Braces className="w-3 h-3" />
                Raw JSON
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Structured view ── */}
          <TabsContent value="structured" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="px-5 py-4 space-y-6">

                {/* Event Details */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Event Details</h3>
                  <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2.5">
                    <MetaRow icon={Clock}  label="Timestamp"  value={formatTs(log.timestamp)} />
                    <MetaRow icon={Tag}    label="Event type" value={log.raw.event_type} />
                    {log.traceId  && <MetaRow icon={Hash}   label="Trace ID"   value={log.traceId} />}
                    {log.duration && <MetaRow icon={Zap}    label="Duration"   value={log.duration} />}
                    {log.source   && <MetaRow icon={Server} label="Source"     value={log.source} />}
                  </div>
                </div>

                {/* Actor */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actor</h3>
                  <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2.5">
                    <MetaRow icon={User}   label="User"      value={log.raw.actor.user_name} />
                    <MetaRow icon={Hash}   label="User ID"   value={log.raw.actor.user_id} />
                    <MetaRow icon={Server} label="Tenant"    value={log.raw.actor.tenant_name} />
                    <MetaRow icon={Hash}   label="Tenant ID" value={log.raw.actor.tenant_id} />
                  </div>
                </div>

                {/* Description */}
                {log.details && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</h3>
                    <p className="text-sm text-foreground leading-relaxed">{log.details}</p>
                  </div>
                )}

                {/* Metadata / details */}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                    <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                      {Object.entries(log.metadata).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between px-3 py-2 hover:bg-accent/30 group">
                          <span className="text-xs text-muted-foreground">{k}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono text-foreground">{v}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <CopyButton text={v} />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stack trace */}
                {log.stackTrace && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" /> Stack Trace
                      </h3>
                      <CopyButton text={log.stackTrace} />
                    </div>
                    <pre className="text-[11px] font-mono text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {log.stackTrace}
                    </pre>
                  </div>
                )}

                {/* Related events */}
                {log.relatedEvents && log.relatedEvents.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Link2 className="w-3 h-3" /> Related Events
                    </h3>
                    <div className="space-y-1.5">
                      {log.relatedEvents.map((rel) => {
                        const relCfg = levelConfig[rel.level];
                        const RelIcon = relCfg.icon;
                        return (
                          <button
                            key={rel.id}
                            onClick={() => onSelectRelated(rel.id)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors text-left group"
                          >
                            <RelIcon className={cn("w-3.5 h-3.5 shrink-0", relCfg.textClass)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{rel.label}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{formatShort(rel.timestamp)}</p>
                            </div>
                            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trace ID */}
                {log.traceId && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Trace</h3>
                    <div className="flex items-center justify-between bg-muted/40 border border-border rounded-lg px-3 py-2">
                      <code className="text-xs font-mono text-muted-foreground">{log.traceId}</code>
                      <CopyButton text={log.traceId} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Raw JSON view ── */}
          <TabsContent value="json" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Braces className="w-3 h-3" /> BSON Document
                  </h3>
                  <CopyButton text={JSON.stringify(log.raw, null, 2)} />
                </div>
                <div className="bg-[hsl(240,10%,4%)] border border-border rounded-lg p-4 overflow-x-auto">
                  <JsonHighlight data={log.raw} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const WorkspaceLogsSection = () => {
  const [logs, setLogs]               = useState<LogEntry[]>(SEED_LOGS);
  const [isLive, setIsLive]           = useState(true);
  const [isPaused, setIsPaused]       = useState(false);
  const [newCount, setNewCount]       = useState(0);
  const [search, setSearch]           = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | "all">("all");
  const [dateRange, setDateRange]     = useState<DateRange | undefined>();
  const [dateOpen, setDateOpen]       = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    if (isPaused) return;
    if (Math.random() < 0.45) {
      const entry = makeStreamEntry();
      setLogs(prev => [entry, ...prev]);
      setNewCount(c => c + 1);
      setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 8000);
    }
  }, [isPaused]);

  useEffect(() => {
    if (isLive) intervalRef.current = setInterval(tick, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, tick]);

  const toggleLive  = () => { setIsLive(v => !v); setIsPaused(false); };
  const togglePause = () => setIsPaused(v => !v);

  const handleExport = () => {
    const rows = filtered.map(l =>
      `${l.timestamp}\t${l.level.toUpperCase()}\t${l.category}\t${l.raw.event_type}\t${l.raw.actor.user_name}\t${l.message}`
    ).join("\n");
    const blob = new Blob([`Timestamp\tLevel\tCategory\tEvent Type\tActor\tMessage\n${rows}`], { type: "text/tsv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "workspace-logs.tsv"; a.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer    = (log: LogEntry) => { setSelectedLog(log); setDrawerOpen(true); };
  const handleRelated = (id: string) => { const t = logs.find(l => l.id === id); if (t) setSelectedLog(t); };
  const clearDate     = () => setDateRange(undefined);

  const filtered = useMemo(() => logs.filter((log) => {
    if (levelFilter !== "all" && log.level !== levelFilter) return false;
    if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
    if (dateRange?.from) {
      const ts   = parseISO(log.timestamp);
      const from = startOfDay(dateRange.from);
      const to   = endOfDay(dateRange.to ?? dateRange.from);
      if (!isWithinInterval(ts, { start: from, end: to })) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.details?.toLowerCase().includes(q) ?? false) ||
        (log.source?.toLowerCase().includes(q) ?? false) ||
        (log.user?.toLowerCase().includes(q) ?? false) ||
        log.raw.event_type.toLowerCase().includes(q) ||
        log.raw.actor.user_name.toLowerCase().includes(q) ||
        (log.traceId?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  }), [logs, search, levelFilter, categoryFilter, dateRange]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    ALL_LEVELS.forEach(lvl => { c[lvl] = logs.filter(l => l.level === lvl).length; });
    return c;
  }, [logs]);

  const dateLabel = dateRange?.from
    ? dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            Activity Logs
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground ml-1">
                <span className={cn("inline-block w-2 h-2 rounded-full", isPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse")} />
                {isPaused ? "Paused" : "Live"}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time activity feed — syncs, queries, users, files, and system events.</p>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <Button variant="outline" size="sm" onClick={togglePause} className="gap-1.5">
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          <Button variant={isLive ? "default" : "outline"} size="sm" onClick={toggleLive} className="gap-1.5">
            {isLive ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            {isLive ? "Disconnect" : "Go Live"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search message, event type, actor, trace ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline" size="sm"
              className={cn("gap-1.5 h-8 text-sm font-normal", dateLabel && "border-primary/50 text-primary")}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateLabel ?? "Date range"}
              {dateLabel && (
                <span onClick={(e) => { e.stopPropagation(); clearDate(); }} className="ml-1 rounded hover:bg-primary/10 p-0.5">
                  <X className="w-3 h-3" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2}
              className="p-3 pointer-events-auto" disabled={(d) => d > new Date()} />
            {dateRange?.from && (
              <div className="px-3 pb-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { clearDate(); setDateOpen(false); }}>Clear</Button>
                <Button size="sm" onClick={() => setDateOpen(false)}>Apply</Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Level filters */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLevelFilter("all")}
            className={cn("px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
              levelFilter === "all" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-accent"
            )}
          >All</button>
          {ALL_LEVELS.map((lvl) => {
            const cfg = levelConfig[lvl];
            return (
              <button key={lvl}
                onClick={() => setLevelFilter(levelFilter === lvl ? "all" : lvl)}
                className={cn("px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1",
                  levelFilter === lvl ? cfg.badgeClass : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {cfg.label}
                {counts[lvl] > 0 && (
                  <span className={cn("text-[10px] px-1 rounded-full font-mono", levelFilter === lvl ? "" : "bg-muted text-muted-foreground")}>
                    {counts[lvl]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1 flex-wrap">
          {ALL_CATEGORIES.map((cat) => (
            <button key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
              className={cn("px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                categoryFilter === cat ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No log entries match your filters.</p>
          </div>
        ) : (
          filtered.map((log, idx) => {
            const cfg  = levelConfig[log.level];
            const Icon = cfg.icon;
            const isNew = idx < newCount;
            return (
              <div
                key={log.id}
                onClick={() => openDrawer(log)}
                className={cn(
                  "group bg-card cursor-pointer hover:bg-accent/40 transition-colors",
                  isNew && "animate-fade-in",
                  selectedLog?.id === log.id && drawerOpen && "bg-accent/60"
                )}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.textClass)} />
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isNew && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded animate-pulse">new</span>
                      )}
                      <span className="text-sm font-medium text-foreground leading-snug">{log.message}</span>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 leading-5 font-medium", cfg.badgeClass)}>
                        {cfg.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-5 text-muted-foreground">
                        {categoryLabels[log.category]}
                      </Badge>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-0 text-xs text-muted-foreground">
                      <span className="font-mono">{formatShort(log.timestamp)}</span>
                      <span>· <code className="font-mono text-[10px]">{log.raw.event_type}</code></span>
                      {log.raw.actor.user_name !== "system" && <span>· {log.raw.actor.user_name}</span>}
                      {log.source   && <span>· {log.source}</span>}
                      {log.duration && <span>· ⏱ {log.duration}</span>}
                      {log.stackTrace && <span className="text-destructive/70 font-medium">· stack trace</span>}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5 -rotate-90" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Total: {logs.length} entries</span>
        <span>Showing {filtered.length} matching entries</span>
      </div>

      <LogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectRelated={handleRelated}
      />
    </div>
  );
};
