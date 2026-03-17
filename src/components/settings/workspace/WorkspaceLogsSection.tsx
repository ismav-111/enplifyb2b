import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Search, RefreshCw, Download, CheckCircle2, AlertTriangle, XCircle,
  Info, ChevronDown, CalendarIcon, X, Copy, Check, ExternalLink,
  Wifi, WifiOff, Pause, Play, Clock, User, Server, Zap, Hash,
  Link2, Terminal, Tag, Activity
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type LogLevel = "info" | "success" | "warning" | "error";
type LogCategory = "sync" | "auth" | "query" | "system" | "user";

interface RelatedEvent {
  id: string;
  label: string;
  timestamp: string;
  level: LogLevel;
}

interface LogEntry {
  id: string;
  timestamp: string; // ISO format for parsing
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
}

// ─── Static seed logs ─────────────────────────────────────────────────────────
const SEED_LOGS: LogEntry[] = [
  {
    id: "s1",
    timestamp: "2024-03-17T14:32:05.000Z",
    level: "success",
    category: "sync",
    message: "Salesforce sync completed successfully",
    details: "Full refresh completed. All records reconciled against remote state.",
    source: "Salesforce CRM",
    duration: "12.4s",
    traceId: "trace-sfdc-8821",
    metadata: { "Records synced": "1,248", "Updated": "842", "New": "406", "Skipped": "0", "Connector version": "2.4.1" },
    relatedEvents: [
      { id: "s2", label: "Salesforce sync started", timestamp: "2024-03-17T14:31:50.000Z", level: "info" },
      { id: "s3", label: "Token refreshed for Salesforce", timestamp: "2024-03-17T14:31:48.000Z", level: "info" },
    ],
  },
  {
    id: "s2",
    timestamp: "2024-03-17T14:31:50.000Z",
    level: "info",
    category: "sync",
    message: "Salesforce sync started",
    details: "Initiating full refresh for Salesforce CRM connector.",
    source: "Salesforce CRM",
    traceId: "trace-sfdc-8821",
    duration: "—",
    metadata: { "Trigger": "Scheduled", "Schedule": "Every 30 min", "Connector": "Salesforce CRM v2.4.1" },
  },
  {
    id: "s3",
    timestamp: "2024-03-17T13:58:21.000Z",
    level: "warning",
    category: "query",
    message: "Slow query detected on Snowflake data source",
    details: "Query execution exceeded the 15s threshold. Consider adding a covering index or narrowing the date filter.",
    source: "Snowflake Analytics",
    duration: "18.2s",
    user: "alice@acme.com",
    traceId: "trace-qry-3310",
    metadata: { "Query hash": "a3f9d821", "Rows scanned": "2.4M", "Rows returned": "1,240", "Warehouse": "COMPUTE_WH" },
    relatedEvents: [
      { id: "s1", label: "Salesforce sync completed", timestamp: "2024-03-17T14:32:05.000Z", level: "success" },
    ],
  },
  {
    id: "s4",
    timestamp: "2024-03-17T13:45:10.000Z",
    level: "error",
    category: "sync",
    message: "OneDrive sync failed — authentication token expired",
    details: "OAuth 2.0 access token expired. The connector could not refresh the token automatically. Re-authenticate in Configuration → OneDrive.",
    source: "OneDrive",
    traceId: "trace-od-0012",
    metadata: { "Connector": "OneDrive v1.2.0", "Token expiry": "2024-03-17T13:44:00Z", "Retry attempts": "3" },
    stackTrace: `Error: OAuth token refresh failed
  at OAuthConnector.refreshToken (connectors/oauth.ts:88)
  at OneDriveSync.authenticate (connectors/onedrive.ts:42)
  at SyncEngine.run (engine/sync.ts:120)
  at Scheduler.tick (scheduler/index.ts:55)
Caused by: HTTPError: 401 Unauthorized — token_expired
  at fetchWithRetry (lib/http.ts:34)`,
    relatedEvents: [
      { id: "s5", label: "OneDrive sync started", timestamp: "2024-03-17T13:44:55.000Z", level: "info" },
    ],
  },
  {
    id: "s5",
    timestamp: "2024-03-17T13:44:55.000Z",
    level: "info",
    category: "sync",
    message: "OneDrive sync started",
    source: "OneDrive",
    traceId: "trace-od-0012",
    metadata: { "Trigger": "Manual", "Initiated by": "admin@acme.com" },
  },
  {
    id: "s6",
    timestamp: "2024-03-17T13:20:00.000Z",
    level: "info",
    category: "user",
    message: "User alice@acme.com joined the workspace",
    details: "User account provisioned and role assigned.",
    source: "User Management",
    user: "admin@acme.com",
    ip: "10.0.1.14",
    metadata: { "Role assigned": "Editor", "Invited by": "admin@acme.com", "Method": "Email invite" },
  },
  {
    id: "s7",
    timestamp: "2024-03-17T12:55:44.000Z",
    level: "success",
    category: "query",
    message: "AI query answered with 6 sources",
    details: "Query: 'What were Q1 revenue drivers?' — 6 document chunks retrieved across 3 data sources.",
    source: "Query Engine",
    duration: "3.1s",
    user: "alice@acme.com",
    traceId: "trace-qry-2201",
    metadata: { "Chunks retrieved": "6", "Sources used": "3", "Model": "gpt-4o", "Tokens in": "1,840", "Tokens out": "512" },
  },
  {
    id: "s8",
    timestamp: "2024-03-17T12:30:12.000Z",
    level: "info",
    category: "system",
    message: "Guardrails policy updated",
    details: "System prompt and topic restrictions updated by workspace admin.",
    source: "System",
    user: "admin@acme.com",
    ip: "10.0.1.14",
    metadata: { "Changed by": "admin@acme.com", "Policy version": "v5", "Previous version": "v4" },
  },
  {
    id: "s9",
    timestamp: "2024-03-17T11:48:30.000Z",
    level: "success",
    category: "sync",
    message: "Google Drive sync completed",
    details: "Incremental sync. Only changed files since last run were processed.",
    source: "Google Drive",
    duration: "4.8s",
    traceId: "trace-gdrive-5511",
    metadata: { "Files synced": "312", "Updated": "78", "New": "234", "Removed": "0" },
  },
  {
    id: "s10",
    timestamp: "2024-03-17T11:20:05.000Z",
    level: "warning",
    category: "auth",
    message: "Multiple failed login attempts detected",
    details: "3 consecutive failed authentication attempts. Account temporarily throttled for 5 minutes.",
    source: "Auth",
    ip: "192.168.1.104",
    user: "bob@acme.com",
    metadata: { "Attempts": "3", "Throttle duration": "5 min", "IP": "192.168.1.104", "Method": "Password" },
    stackTrace: `AuthError: Max retry attempts exceeded
  at AuthMiddleware.validateCredentials (auth/middleware.ts:77)
  at AuthController.login (auth/controller.ts:33)
  at Router.handle (router/index.ts:102)`,
  },
  {
    id: "s11",
    timestamp: "2024-03-17T10:55:00.000Z",
    level: "error",
    category: "sync",
    message: "ServiceNow connector returned 403 Forbidden",
    details: "The configured API key lacks read access to the 'incidents' table. Update key permissions in ServiceNow.",
    source: "ServiceNow",
    traceId: "trace-sn-9933",
    metadata: { "HTTP status": "403", "Endpoint": "/api/now/table/incident", "API key": "sn_key_***redacted***" },
    stackTrace: `HTTPError: 403 Forbidden
  at ServiceNowConnector.fetchPage (connectors/servicenow.ts:66)
  at ServiceNowSync.syncTable (connectors/servicenow.ts:112)
  at SyncEngine.run (engine/sync.ts:120)
  at Scheduler.tick (scheduler/index.ts:55)`,
    relatedEvents: [
      { id: "s12", label: "ServiceNow sync started", timestamp: "2024-03-17T10:54:40.000Z", level: "info" },
    ],
  },
  {
    id: "s12",
    timestamp: "2024-03-17T10:54:40.000Z",
    level: "info",
    category: "sync",
    message: "ServiceNow sync started",
    source: "ServiceNow",
    traceId: "trace-sn-9933",
    metadata: { "Trigger": "Scheduled", "Tables": "incidents, changes, problems" },
  },
  {
    id: "s13",
    timestamp: "2024-03-17T10:30:18.000Z",
    level: "info",
    category: "user",
    message: "User carol@acme.com removed from workspace",
    source: "User Management",
    user: "admin@acme.com",
    metadata: { "Removed by": "admin@acme.com", "Previous role": "Viewer" },
  },
  {
    id: "s14",
    timestamp: "2024-03-17T09:15:44.000Z",
    level: "success",
    category: "auth",
    message: "SSO authentication successful",
    details: "User authenticated via SAML 2.0 SSO. Session established.",
    source: "Auth",
    user: "dave@acme.com",
    ip: "203.0.113.55",
    duration: "0.3s",
    metadata: { "Method": "SAML 2.0", "IdP": "Okta", "Session TTL": "8h", "MFA": "Passed" },
  },
];

// Streaming log templates
const STREAM_TEMPLATES: Omit<LogEntry, "id" | "timestamp">[] = [
  {
    level: "info", category: "sync", message: "Snowflake incremental sync started",
    source: "Snowflake Analytics", metadata: { "Trigger": "Scheduled", "Mode": "Incremental" },
  },
  {
    level: "success", category: "query", message: "AI query answered with 4 sources",
    source: "Query Engine", duration: "2.7s",
    metadata: { "Chunks retrieved": "4", "Model": "gpt-4o", "Tokens in": "1,100", "Tokens out": "380" },
    user: "alice@acme.com",
  },
  {
    level: "info", category: "user", message: "User dave@acme.com accessed workspace",
    source: "User Management", ip: "203.0.113.55",
    metadata: { "Method": "SSO", "IP": "203.0.113.55" },
  },
  {
    level: "warning", category: "system", message: "Workspace storage nearing 80% capacity",
    source: "System", details: "Consider removing unused documents or upgrading your plan.",
    metadata: { "Used": "8.1 GB", "Limit": "10 GB", "Usage": "81%" },
  },
  {
    level: "success", category: "sync", message: "SharePoint sync completed",
    source: "SharePoint", duration: "6.2s",
    metadata: { "Files synced": "88", "Updated": "22", "New": "66" },
  },
  {
    level: "info", category: "auth", message: "Token refreshed for Salesforce CRM",
    source: "Auth", metadata: { "Connector": "Salesforce CRM", "Token TTL": "1h" },
  },
  {
    level: "error", category: "query", message: "Query failed — context window exceeded",
    source: "Query Engine", details: "The retrieved context exceeded the model's token limit. Try narrowing your search filters.",
    metadata: { "Tokens in": "128,100", "Limit": "128,000", "Model": "gpt-4o" },
    stackTrace: `ContextWindowError: Input exceeds maximum token limit
  at ContextBuilder.build (engine/context.ts:212)
  at QueryEngine.answer (engine/query.ts:88)
  at APIHandler.query (api/handlers.ts:45)`,
  },
  {
    level: "info", category: "system", message: "Workspace settings snapshot created",
    source: "System", metadata: { "Snapshot ID": "snap-0044", "Triggered by": "Scheduled" },
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────
const levelConfig: Record<LogLevel, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badgeClass: string;
  textClass: string;
  dotClass: string;
}> = {
  success: { icon: CheckCircle2, label: "Success", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", textClass: "text-emerald-600", dotClass: "bg-emerald-500" },
  info:    { icon: Info,          label: "Info",    badgeClass: "bg-primary/10 text-primary border-primary/20",                 textClass: "text-primary",   dotClass: "bg-primary" },
  warning: { icon: AlertTriangle, label: "Warning", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",           textClass: "text-amber-600", dotClass: "bg-amber-500" },
  error:   { icon: XCircle,       label: "Error",   badgeClass: "bg-destructive/10 text-destructive border-destructive/20",     textClass: "text-destructive", dotClass: "bg-destructive" },
};

const categoryLabels: Record<LogCategory, string> = { sync: "Sync", auth: "Auth", query: "Query", system: "System", user: "User" };
const ALL_LEVELS: LogLevel[]     = ["info", "success", "warning", "error"];
const ALL_CATEGORIES: LogCategory[] = ["sync", "auth", "query", "system", "user"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTs = (iso: string) =>
  format(parseISO(iso), "MMM d, yyyy  HH:mm:ss");

const formatShort = (iso: string) =>
  format(parseISO(iso), "HH:mm:ss");

let streamCounter = 0;
const makeStreamEntry = (): LogEntry => {
  const tpl = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)];
  streamCounter++;
  return {
    ...tpl,
    id: `live-${Date.now()}-${streamCounter}`,
    timestamp: new Date().toISOString(),
    traceId: `trace-live-${String(streamCounter).padStart(4, "0")}`,
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

// ─── Detail Drawer ────────────────────────────────────────────────────────────
const LogDetailDrawer = ({
  log,
  open,
  onClose,
  onSelectRelated,
}: {
  log: LogEntry | null;
  open: boolean;
  onClose: () => void;
  onSelectRelated: (id: string) => void;
}) => {
  if (!log) return null;
  const cfg = levelConfig[log.level];
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
                {log.source && (
                  <span className="text-[11px] text-muted-foreground">{log.source}</span>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-6">

            {/* Core metadata */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Event Details</h3>
              <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2.5">
                <MetaRow icon={Clock}  label="Timestamp"  value={formatTs(log.timestamp)} />
                {log.traceId  && <MetaRow icon={Hash}   label="Trace ID"   value={log.traceId} />}
                {log.duration && <MetaRow icon={Zap}    label="Duration"   value={log.duration} />}
                {log.user     && <MetaRow icon={User}   label="User"       value={log.user} />}
                {log.ip       && <MetaRow icon={Server} label="IP address" value={log.ip} />}
                {log.source   && <MetaRow icon={Tag}    label="Source"     value={log.source} />}
              </div>
            </div>

            {/* Description */}
            {log.details && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Description</h3>
                <p className="text-sm text-foreground leading-relaxed">{log.details}</p>
              </div>
            )}

            {/* Extended metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h3>
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
                    <Terminal className="w-3 h-3" />
                    Stack Trace
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
                  <Link2 className="w-3 h-3" />
                  Related Events
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

            {/* Trace ID copy */}
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
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const WorkspaceLogsSection = () => {
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
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
  const listRef = useRef<HTMLDivElement>(null);

  // Simulate streaming
  const tick = useCallback(() => {
    if (isPaused) return;
    if (Math.random() < 0.45) { // ~45% chance each tick
      const entry = makeStreamEntry();
      setLogs(prev => [entry, ...prev]);
      setNewCount(c => c + 1);
      setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 8000);
    }
  }, [isPaused]);

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(tick, 3500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, tick]);

  const toggleLive = () => {
    setIsLive(v => !v);
    setIsPaused(false);
  };
  const togglePause = () => setIsPaused(v => !v);

  const handleExport = () => {
    const rows = filtered.map(l =>
      `${l.timestamp}\t${l.level.toUpperCase()}\t${l.category}\t${l.source ?? ""}\t${l.message}`
    ).join("\n");
    const blob = new Blob([`Timestamp\tLevel\tCategory\tSource\tMessage\n${rows}`], { type: "text/tsv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "workspace-logs.tsv"; a.click();
    URL.revokeObjectURL(url);
  };

  const openDrawer = (log: LogEntry) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handleRelated = (id: string) => {
    const target = logs.find(l => l.id === id);
    if (target) setSelectedLog(target);
  };

  const clearDateRange = () => setDateRange(undefined);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
      if (dateRange?.from) {
        const ts = parseISO(log.timestamp);
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
          (log.traceId?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [logs, search, levelFilter, categoryFilter, dateRange]);

  // Counts for filter badges
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
        <div className="flex items-center gap-3">
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
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time activity feed — syncs, queries, users, and system events.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <Button variant="outline" size="sm" onClick={togglePause} className="gap-1.5">
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={toggleLive}
            className="gap-1.5"
          >
            {isLive ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            {isLive ? "Disconnect" : "Go Live"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search message, source, user, trace ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
        </div>

        {/* Date range picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-1.5 h-8 text-sm font-normal", dateLabel && "border-primary/50 text-primary")}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateLabel ?? "Date range"}
              {dateLabel && (
                <span
                  onClick={(e) => { e.stopPropagation(); clearDateRange(); }}
                  className="ml-1 rounded hover:bg-primary/10 p-0.5"
                >
                  <X className="w-3 h-3" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
              disabled={(d) => d > new Date()}
            />
            {dateRange?.from && (
              <div className="px-3 pb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => { clearDateRange(); setDateOpen(false); }}>
                  Clear
                </Button>
                <Button size="sm" onClick={() => setDateOpen(false)} className="ml-2">
                  Apply
                </Button>
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
          >
            All
          </button>
          {ALL_LEVELS.map((lvl) => {
            const cfg = levelConfig[lvl];
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(levelFilter === lvl ? "all" : lvl)}
                className={cn("px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1",
                  levelFilter === lvl ? cfg.badgeClass : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {cfg.label}
                {counts[lvl] > 0 && (
                  <span className={cn("text-[10px] px-1 rounded-full font-mono",
                    levelFilter === lvl ? "" : "bg-muted text-muted-foreground"
                  )}>
                    {counts[lvl]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
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
      <div ref={listRef} className="border border-border rounded-lg overflow-hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No log entries match your filters.</p>
          </div>
        ) : (
          filtered.map((log, idx) => {
            const cfg = levelConfig[log.level];
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
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-1.5 py-0.5 rounded animate-pulse">
                          new
                        </span>
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
                      {log.source   && <span>· {log.source}</span>}
                      {log.user     && <span>· {log.user}</span>}
                      {log.duration && <span>· ⏱ {log.duration}</span>}
                      {log.traceId  && <span className="hidden sm:inline">· <code className="font-mono text-[10px]">{log.traceId}</code></span>}
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

      {/* Detail Drawer */}
      <LogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelectRelated={handleRelated}
      />
    </div>
  );
};
