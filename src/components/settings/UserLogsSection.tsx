import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search, Download, Pause, Play, Radio, X, ChevronDown, ChevronRight,
  Info, CheckCircle2, AlertTriangle, XCircle, Filter, Calendar as CalendarIcon,
  Copy, Check, Clock, User, Globe, Layers, Cpu, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogLevel = "info" | "success" | "warning" | "error";
type LogCategory =
  | "auth"
  | "query"
  | "export"
  | "workspace"
  | "account"
  | "api"
  | "session"
  | "file";

interface RelatedEvent {
  id: string;
  label: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: string;
  workspace?: string;
  ipAddress?: string;
  userAgent?: string;
  duration?: string;
  stackTrace?: string;
  meta?: Record<string, string>;
  relatedEvents?: RelatedEvent[];
  isNew?: boolean;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();
const ts = (offsetMs: number) => new Date(Date.now() - offsetMs).toISOString();

const SEED_LOGS: LogEntry[] = [
  {
    id: "ul-001", timestamp: ts(120_000), level: "info", category: "auth",
    message: "User signed in",
    details: "Successful login via email/password from a recognised device.",
    workspace: "Analytics Projects",
    ipAddress: "192.168.1.45", userAgent: "Chrome 124 / macOS 14",
    meta: { method: "email", mfa: "TOTP", device: "MacBook Pro" },
    relatedEvents: [{ id: "ul-002", label: "Session created" }],
  },
  {
    id: "ul-002", timestamp: ts(119_500), level: "success", category: "session",
    message: "Session created",
    details: "New authenticated session token issued after successful login.",
    workspace: "Analytics Projects",
    ipAddress: "192.168.1.45", duration: "—",
    meta: { sessionId: "sess_aB3kLm9p", expiresIn: "8h", scope: "full" },
    relatedEvents: [{ id: "ul-001", label: "User signed in" }],
  },
  {
    id: "ul-003", timestamp: ts(95_000), level: "info", category: "query",
    message: "Natural language query executed",
    details: "Query: 'Show me Q4 revenue by region' processed against Snowflake connector.",
    workspace: "Acme Corp Reports",
    duration: "1.24s",
    meta: { queryId: "qry_7xRz2", tokens: "312", connector: "Snowflake", rows: "2,840" },
    relatedEvents: [],
  },
  {
    id: "ul-004", timestamp: ts(88_000), level: "success", category: "export",
    message: "Report exported as PDF",
    details: "Q4 Revenue Analysis report successfully rendered and downloaded.",
    workspace: "Acme Corp Reports",
    duration: "3.1s",
    meta: { fileName: "Q4_Revenue_Analysis.pdf", size: "2.3 MB", pages: "12" },
  },
  {
    id: "ul-005", timestamp: ts(72_000), level: "warning", category: "api",
    message: "API rate limit approaching",
    details: "OpenAI API usage at 87% of hourly quota. Queries may be throttled.",
    workspace: "Data Exploration",
    meta: { provider: "OpenAI", used: "870/1000", resetIn: "13m" },
  },
  {
    id: "ul-006", timestamp: ts(55_000), level: "info", category: "workspace",
    message: "Workspace settings updated",
    details: "Guard rails configuration modified — 'Block PII queries' enabled.",
    workspace: "Analytics Projects",
    meta: { setting: "guardrails.blockPII", prev: "false", next: "true" },
  },
  {
    id: "ul-007", timestamp: ts(40_000), level: "info", category: "query",
    message: "Query result cached",
    details: "Response cached for 30 minutes to optimise repeated queries.",
    workspace: "Acme Corp Reports",
    duration: "0.08s",
    meta: { queryHash: "a1b2c3d4", ttl: "30m", hitCount: "0" },
  },
  {
    id: "ul-008", timestamp: ts(30_000), level: "error", category: "file",
    message: "File upload failed",
    details: "PDF upload rejected — file exceeds the 50 MB workspace limit.",
    workspace: "Data Exploration",
    stackTrace: `Error: FileSizeLimitExceeded\n  at FileUploadHandler.validate (upload.ts:88)\n  at WorkspaceFilesSection.handleDrop (DataSourcesSection.tsx:614)\n  at HTMLElement.<anonymous> (drop-zone.ts:42)`,
    meta: { fileName: "Annual_Report_Full.pdf", size: "73.2 MB", limit: "50 MB" },
  },
  {
    id: "ul-009", timestamp: ts(18_000), level: "success", category: "account",
    message: "API key rotated",
    details: "Workspace API key rotated successfully. Previous key invalidated.",
    workspace: "Analytics Projects",
    meta: { keyId: "key_mN7pQr", rotatedBy: "You", previousAge: "32 days" },
  },
  {
    id: "ul-010", timestamp: ts(5_000), level: "info", category: "session",
    message: "Session heartbeat",
    details: "Active session renewed. Idle timeout counter reset.",
    workspace: "Analytics Projects",
    meta: { sessionId: "sess_aB3kLm9p", idleSince: "0s" },
  },
];

// ─── Stream templates ─────────────────────────────────────────────────────────

const STREAM_TEMPLATES = [
  { level: "info" as LogLevel, category: "query" as LogCategory, message: "Query executed", details: "User query processed successfully.", workspace: "Analytics Projects", duration: "0.92s", meta: { tokens: "210", connector: "Snowflake" } },
  { level: "success" as LogLevel, category: "auth" as LogCategory, message: "MFA verified", details: "Two-factor authentication challenge passed.", workspace: "Acme Corp Reports", meta: { method: "TOTP" } },
  { level: "warning" as LogLevel, category: "api" as LogCategory, message: "Slow API response", details: "Connector response exceeded 3 s threshold.", workspace: "Data Exploration", duration: "3.4s", meta: { connector: "Salesforce" } },
  { level: "info" as LogLevel, category: "export" as LogCategory, message: "CSV export started", details: "Exporting query results to CSV.", workspace: "Acme Corp Reports", meta: { rows: "1,200" } },
  { level: "success" as LogLevel, category: "workspace" as LogCategory, message: "Data source synced", details: "Incremental sync completed with no errors.", workspace: "Marketing Team", duration: "8.2s", meta: { source: "Google Drive", files: "14" } },
  { level: "error" as LogLevel, category: "query" as LogCategory, message: "Query timeout", details: "Query exceeded the 30 s execution limit.", workspace: "Data Exploration", duration: "30.0s", stackTrace: "Error: QueryTimeoutError\n  at QueryRunner.execute (runner.ts:211)\n  at ChatHandler.process (chat.ts:98)", meta: { queryId: "qry_timeout_99" } },
  { level: "info" as LogLevel, category: "session" as LogCategory, message: "Tab focus restored", details: "User returned to active session after inactivity.", workspace: "Analytics Projects", meta: { idleDuration: "4m 12s" } },
];

let streamCounter = 100;
const makeStreamEntry = (): LogEntry => {
  const t = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)];
  streamCounter++;
  return {
    ...t,
    id: `ul-s${streamCounter}`,
    timestamp: now(),
    isNew: true,
    relatedEvents: [],
  };
};

// ─── Config ───────────────────────────────────────────────────────────────────

const levelConfig: Record<LogLevel, { icon: React.ElementType; label: string; row: string; badge: string }> = {
  info:    { icon: Info,          label: "Info",    row: "text-foreground",     badge: "bg-primary/10 text-primary border-primary/20" },
  success: { icon: CheckCircle2,  label: "Success", row: "text-foreground",     badge: "bg-success/10 text-success border-success/20" },
  warning: { icon: AlertTriangle, label: "Warning", row: "text-warning",        badge: "bg-warning/10 text-warning border-warning/20" },
  error:   { icon: XCircle,       label: "Error",   row: "text-destructive",    badge: "bg-destructive/10 text-destructive border-destructive/20" },
};

const categoryLabels: Record<LogCategory, string> = {
  auth: "Auth", query: "Query", export: "Export",
  workspace: "Workspace", account: "Account",
  api: "API", session: "Session", file: "File",
};

const ALL_LEVELS: LogLevel[] = ["info", "success", "warning", "error"];
const ALL_CATEGORIES: LogCategory[] = ["auth", "query", "export", "workspace", "account", "api", "session", "file"];

const formatTs = (iso: string) => {
  try { return format(new Date(iso), "MMM d, yyyy HH:mm:ss"); } catch { return iso; }
};
const formatShort = (iso: string) => {
  try { return format(new Date(iso), "HH:mm:ss"); } catch { return iso; }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const MetaRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
    <span className="text-muted-foreground w-24 shrink-0">{label}</span>
    <span className="text-foreground font-mono break-all">{value}</span>
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

interface DrawerProps {
  log: LogEntry | null;
  open: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

const LogDetailDrawer = ({ log, open, onClose, onNavigate }: DrawerProps) => {
  if (!log) return null;
  const { icon: LevelIcon, badge, label } = levelConfig[log.level];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[460px] sm:w-[520px] flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3">
            <LevelIcon className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base font-semibold leading-snug">{log.message}</SheetTitle>
              <p className="text-xs text-muted-foreground mt-1 font-mono">{formatTs(log.timestamp)}</p>
            </div>
            <Badge variant="outline" className={cn("text-xs shrink-0", badge)}>
              {label}
            </Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Description */}
          {log.details && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{log.details}</p>
            </div>
          )}

          {/* Event details */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Event Details</p>
            <div className="space-y-2.5">
              <MetaRow icon={Clock}  label="Timestamp"  value={formatTs(log.timestamp)} />
              <MetaRow icon={Layers} label="Category"   value={categoryLabels[log.category]} />
              {log.workspace   && <MetaRow icon={Globe}  label="Workspace"  value={log.workspace} />}
              {log.duration    && <MetaRow icon={Cpu}    label="Duration"   value={log.duration} />}
              {log.ipAddress   && <MetaRow icon={Globe}  label="IP Address" value={log.ipAddress} />}
              {log.userAgent   && <MetaRow icon={User}   label="User Agent" value={log.userAgent} />}
            </div>
          </div>

          {/* Metadata */}
          {log.meta && Object.keys(log.meta).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Metadata</p>
              <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border/50">
                {Object.entries(log.meta).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="text-muted-foreground font-medium">{k}</span>
                    <span className="font-mono text-foreground">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stack trace */}
          {log.stackTrace && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stack Trace</p>
                <CopyButton text={log.stackTrace} />
              </div>
              <pre className="text-xs font-mono bg-muted/50 border border-border rounded-lg p-3 whitespace-pre-wrap break-all text-destructive leading-relaxed overflow-x-auto">
                {log.stackTrace}
              </pre>
            </div>
          )}

          {/* Related events */}
          {log.relatedEvents && log.relatedEvents.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related Events</p>
              <div className="space-y-1.5">
                {log.relatedEvents.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => onNavigate(ev.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm"
                  >
                    <span className="text-foreground">{ev.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const UserLogsSection = () => {
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
  const [isLive, setIsLive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [search, setSearch] = useState("");
  const [levels, setLevels] = useState<Set<LogLevel>>(new Set());
  const [categories, setCategories] = useState<Set<LogCategory>>(new Set());
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const entry = makeStreamEntry();
    setLogs((prev) => [entry, ...prev].slice(0, 500));
    setTimeout(() => setLogs((prev) => prev.map((l) => l.id === entry.id ? { ...l, isNew: false } : l)), 1500);
  }, []);

  useEffect(() => {
    if (isLive && !isPaused) {
      intervalRef.current = setInterval(tick, 3500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, isPaused, tick]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (levels.size > 0 && !levels.has(log.level)) return false;
      if (categories.size > 0 && !categories.has(log.category)) return false;
      if (dateRange?.from) {
        const d = new Date(log.timestamp);
        const from = startOfDay(dateRange.from);
        const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        if (!isWithinInterval(d, { start: from, end: to })) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q) ||
          log.workspace?.toLowerCase().includes(q) ||
          log.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, levels, categories, dateRange, search]);

  const toggleLevel = (l: LogLevel) => {
    setLevels((prev) => { const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n; });
  };
  const toggleCategory = (c: LogCategory) => {
    setCategories((prev) => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });
  };

  const handleNavigate = (id: string) => {
    const log = logs.find((l) => l.id === id);
    if (log) { setSelectedLog(log); setDrawerOpen(true); }
  };

  const exportTSV = () => {
    const rows = [["Timestamp", "Level", "Category", "Workspace", "Message", "Details"]];
    filtered.forEach((l) => rows.push([l.timestamp, l.level, l.category, l.workspace ?? "", l.message, l.details ?? ""]));
    const content = rows.map((r) => r.join("\t")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/tab-separated-values" }));
    a.download = `user-activity-${format(new Date(), "yyyy-MM-dd")}.tsv`;
    a.click();
  };

  const levelCounts = useMemo(() => {
    const counts: Record<LogLevel, number> = { info: 0, success: 0, warning: 0, error: 0 };
    logs.forEach((l) => counts[l.level]++);
    return counts;
  }, [logs]);

  const hasFilters = levels.size > 0 || categories.size > 0 || !!dateRange || !!search;
  const clearFilters = () => { setLevels(new Set()); setCategories(new Set()); setDateRange(undefined); setSearch(""); };

  const dateLabel = dateRange?.from
    ? dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : "Date range";

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Activity Logs
          </h2>
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className={cn("relative flex h-2 w-2", !isPaused && "")}>
                {!isPaused && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />}
                <span className={cn("relative inline-flex rounded-full h-2 w-2", isPaused ? "bg-muted-foreground" : "bg-success")} />
              </span>
              <span className="text-xs font-medium text-success">{isPaused ? "Paused" : "Live"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLive && (
            <Button variant="outline" size="sm" onClick={() => setIsPaused((p) => !p)} className="h-7 gap-1.5 text-xs">
              {isPaused ? <><Play className="w-3 h-3" />Resume</> : <><Pause className="w-3 h-3" />Pause</>}
            </Button>
          )}
          <Button
            variant={isLive ? "outline" : "outline"}
            size="sm"
            onClick={() => { setIsLive((v) => !v); setIsPaused(false); }}
            className={cn("h-7 gap-1.5 text-xs", isLive ? "text-destructive border-destructive/30 hover:bg-destructive/5" : "text-success border-success/30 hover:bg-success/5")}
          >
            <Radio className="w-3 h-3" />
            {isLive ? "Disconnect" : "Go Live"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportTSV} className="h-7 gap-1.5 text-xs">
            <Download className="w-3 h-3" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border/40 flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages, workspaces…"
              className="pl-8 h-7 text-xs"
            />
          </div>

          {/* Date range */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-7 gap-1.5 text-xs font-normal", dateRange && "border-primary/40 text-primary")}>
                <CalendarIcon className="w-3 h-3" />
                {dateLabel}
                {dateRange && (
                  <span onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }} className="ml-0.5 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                disabled={(d) => d > new Date()}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Level filters */}
          <div className="flex items-center gap-1">
            {ALL_LEVELS.map((l) => {
              const { icon: Icon, badge } = levelConfig[l];
              const active = levels.has(l);
              return (
                <button
                  key={l}
                  onClick={() => toggleLevel(l)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors",
                    active ? badge : "border-border/50 text-muted-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {levelConfig[l].label}
                  <span className="font-mono">{levelCounts[l]}</span>
                </button>
              );
            })}
          </div>

          {/* Category filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-7 gap-1.5 text-xs", categories.size > 0 && "border-primary/40 text-primary")}>
                <Filter className="w-3 h-3" />
                {categories.size > 0 ? `${categories.size} categories` : "Category"}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                {ALL_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={cn(
                      "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors",
                      categories.has(c) ? "bg-primary/10 text-primary" : "hover:bg-accent text-foreground"
                    )}
                  >
                    {categoryLabels[c]}
                    {categories.has(c) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1 text-xs text-muted-foreground">
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>

        {/* Log list */}
        <div className="divide-y divide-border/30">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No log entries match your filters.
            </div>
          ) : (
            filtered.map((log) => {
              const { icon: LevelIcon, badge, row } = levelConfig[log.level];
              return (
                <button
                  key={log.id}
                  onClick={() => { setSelectedLog(log); setDrawerOpen(true); }}
                  className={cn(
                    "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-accent/40 transition-colors group",
                    log.isNew && "animate-pulse bg-success/5",
                    row
                  )}
                >
                  <LevelIcon className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{log.message}</span>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0", badge)}>
                        {categoryLabels[log.category]}
                      </Badge>
                      {log.workspace && (
                        <span className="text-xs text-muted-foreground shrink-0">{log.workspace}</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.details}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {log.duration && <span className="text-xs text-muted-foreground font-mono">{log.duration}</span>}
                    <span className="text-xs text-muted-foreground font-mono opacity-60">{formatShort(log.timestamp)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {filtered.length} of {logs.length} entries
          </span>
          {isLive && !isPaused && (
            <span className="text-xs text-muted-foreground">Streaming every 3.5s</span>
          )}
        </div>
      </div>

      <LogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
    </section>
  );
};
