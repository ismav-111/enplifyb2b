import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search, Download, Pause, Play, Radio, X, ChevronDown, ChevronRight,
  Info, CheckCircle2, AlertTriangle, XCircle, Filter, Calendar as CalendarIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  LogEntry, LogLevel, LogCategory,
  formatEventType, deriveCategory,
  categoryLabels, ALL_CATEGORIES,
} from "@/types/logs";
import { LogDetailDrawer } from "@/components/logs/LogDetailDrawer";

// ─── Shared actor/tenant data ─────────────────────────────────────────────────

const ACTOR_ANAND = {
  user_id: "1b84c6c5-f953-4cf4-978b-72dc50b1616a",
  user_name: "anand.komati",
  tenant_id: "784dbf7f-daf0-4b53-8b83-f6e55147463e",
  tenant_name: "quadrant technologies",
};
const ACTOR_SARAH = {
  user_id: "3c92a7d1-bb21-4ea3-a01c-53ef10c2727b",
  user_name: "sarah.chen",
  tenant_id: "784dbf7f-daf0-4b53-8b83-f6e55147463e",
  tenant_name: "quadrant technologies",
};
const ACTOR_JAMES = {
  user_id: "c7d1e2f3-a4b5-6789-cdef-012345678901",
  user_name: "james.wilson",
  tenant_id: "784dbf7f-daf0-4b53-8b83-f6e55147463e",
  tenant_name: "quadrant technologies",
};
const TENANT = {
  tenant_id: "784dbf7f-daf0-4b53-8b83-f6e55147463e",
  tenant_name: "quadrant technologies",
};

const WS_ID = "67ffdbbf-ae83-4648-8138-568a9ea1c50e";
const WS_NAME = "test";

const ts = (offsetMs: number) => new Date(Date.now() - offsetMs).toISOString();

// ─── Seed logs ────────────────────────────────────────────────────────────────

const SEED_LOGS: LogEntry[] = [
  {
    _id: "69b915307f4d17fd457bd401", event_type: "sync_completed",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_ANAND, tenant: TENANT, occurred_at: ts(140_000),
    details: { source: "Salesforce CRM", records_synced: 1248, updated: 842, new: 406, duration_ms: 12400 },
    level: "success",
  },
  {
    _id: "69b915307f4d17fd457bd402", event_type: "query_executed",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_SARAH, tenant: TENANT, occurred_at: ts(120_000),
    details: { query_id: "qry_7xRz2", query: "Show me Q4 revenue by region", connector: "Snowflake", tokens: 312, rows_returned: 2840, duration_ms: 1240 },
    level: "info",
  },
  {
    _id: "69b915307f4d17fd457bd403", event_type: "member_role_updated",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_ANAND, tenant: TENANT, occurred_at: ts(95_000),
    details: { member_id: "f5e8f52a-d5e1-4d00-b094-71e281802469", new_role: "member", previous_role: "owner" },
    level: "info",
  },
  {
    _id: "69b915307f4d17fd457bd404", event_type: "file_uploaded",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_JAMES, tenant: TENANT, occurred_at: ts(85_000),
    details: { file_name: "Q4_Revenue_Analysis.xlsx", size_bytes: 2_400_000, file_type: "excel" },
    level: "success",
  },
  {
    _id: "69b915307f4d17fd457bd405", event_type: "guardrail_triggered",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_SARAH, tenant: TENANT, occurred_at: ts(72_000),
    details: { rule_id: "block_ssn", rule_name: "Block Social Security Numbers", action: "BLOCK", pattern_matched: "\\d{3}-\\d{2}-\\d{4}" },
    level: "warning",
  },
  {
    _id: "69b915307f4d17fd457bd406", event_type: "query_failed",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_JAMES, tenant: TENANT, occurred_at: ts(60_000),
    details: { query_id: "qry_err_9x", error: "QueryTimeoutError", duration_ms: 30000, connector: "Snowflake" },
    level: "error",
  },
  {
    _id: "69b915307f4d17fd457bd407", event_type: "member_added",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_ANAND, tenant: TENANT, occurred_at: ts(48_000),
    details: { member_id: "c7d1e2f3-a4b5-6789-cdef-012345678901", member_name: "james.wilson", role: "member" },
    level: "success",
  },
  {
    _id: "69b915307f4d17fd457bd408", event_type: "sync_failed",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_ANAND, tenant: TENANT, occurred_at: ts(35_000),
    details: { source: "Google Drive", error: "AuthTokenExpired", retry_scheduled: true, retry_at: new Date(Date.now() + 300_000).toISOString() },
    level: "error",
  },
  {
    _id: "69b915307f4d17fd457bd409", event_type: "settings_updated",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_ANAND, tenant: TENANT, occurred_at: ts(18_000),
    details: { setting_key: "guardrails.blockPII", previous_value: "false", new_value: "true" },
    level: "info",
  },
  {
    _id: "69b915307f4d17fd457bd410", event_type: "data_source_connected",
    workspace_id: WS_ID, workspace_name: WS_NAME,
    actor: ACTOR_SARAH, tenant: TENANT, occurred_at: ts(5_000),
    details: { source: "Snowflake", connector_version: "2.4.1", initial_sync: true },
    level: "success",
  },
];

// ─── Stream templates ─────────────────────────────────────────────────────────

const STREAM_TEMPLATES: Omit<LogEntry, "_id" | "occurred_at" | "isNew">[] = [
  { event_type: "query_executed", workspace_id: WS_ID, workspace_name: WS_NAME, actor: ACTOR_SARAH, tenant: TENANT, details: { query_id: "qry_live_1", tokens: 185, connector: "Snowflake", rows_returned: 920, duration_ms: 780 }, level: "info" },
  { event_type: "file_uploaded", workspace_id: WS_ID, workspace_name: WS_NAME, actor: ACTOR_JAMES, tenant: TENANT, details: { file_name: "March_Report.pdf", size_bytes: 870_000, file_type: "pdf" }, level: "success" },
  { event_type: "sync_completed", workspace_id: WS_ID, workspace_name: WS_NAME, actor: ACTOR_ANAND, tenant: TENANT, details: { source: "Google Drive", files_synced: 14, duration_ms: 8200 }, level: "success" },
  { event_type: "guardrail_triggered", workspace_id: WS_ID, workspace_name: WS_NAME, actor: ACTOR_SARAH, tenant: TENANT, details: { rule_id: "redact_api_keys", rule_name: "Redact API Keys", action: "REDACT" }, level: "warning" },
  { event_type: "member_removed", workspace_id: WS_ID, workspace_name: WS_NAME, actor: ACTOR_ANAND, tenant: TENANT, details: { member_id: "aabb1122-0000-0000-0000-000000000001", member_name: "bob.jones", role: "member" }, level: "warning" },
  { event_type: "query_failed", workspace_id: WS_ID, workspace_name: WS_NAME, actor: ACTOR_JAMES, tenant: TENANT, details: { query_id: "qry_timeout_99", error: "RateLimitExceeded", duration_ms: 1200 }, level: "error" },
];

let streamCounter = 300;
const makeStreamEntry = (): LogEntry => {
  const t = STREAM_TEMPLATES[Math.floor(Math.random() * STREAM_TEMPLATES.length)];
  streamCounter++;
  return { ...t, _id: `ws_stream_${streamCounter}`, occurred_at: new Date().toISOString(), isNew: true };
};

// ─── UI config ────────────────────────────────────────────────────────────────

const ALL_LEVELS: LogLevel[] = ["info", "success", "warning", "error"];

const levelConfig: Record<LogLevel, { icon: React.ElementType; label: string; row: string; badge: string }> = {
  info:    { icon: Info,          label: "Info",    row: "text-foreground",   badge: "bg-primary/10 text-primary border-primary/20" },
  success: { icon: CheckCircle2,  label: "Success", row: "text-foreground",   badge: "bg-success/10 text-success border-success/20" },
  warning: { icon: AlertTriangle, label: "Warning", row: "text-warning",      badge: "bg-warning/10 text-warning border-warning/20" },
  error:   { icon: XCircle,       label: "Error",   row: "text-destructive",  badge: "bg-destructive/10 text-destructive border-destructive/20" },
};

const formatTs = (iso: string) => { try { return format(new Date(iso), "MMM d, yyyy HH:mm:ss"); } catch { return iso; } };
const formatShort = (iso: string) => { try { return format(new Date(iso), "HH:mm:ss"); } catch { return iso; } };

// ─── CopyButton ───────────────────────────────────────────────────────────────

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────

const LogDetailDrawer = ({ log, open, onClose }: { log: LogEntry | null; open: boolean; onClose: () => void }) => {
  if (!log) return null;
  const { icon: LevelIcon, badge, label } = levelConfig[log.level];
  const category = deriveCategory(log.event_type);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:w-[540px] flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start gap-3">
            <LevelIcon className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base font-semibold leading-snug">{formatEventType(log.event_type)}</SheetTitle>
              <p className="text-xs text-muted-foreground font-mono mt-1">{log._id}</p>
            </div>
            <Badge variant="outline" className={cn("text-xs shrink-0", badge)}>{label}</Badge>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Event */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Event</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground w-24 shrink-0">Occurred at</span>
                <span className="text-foreground font-mono">{formatTs(log.occurred_at)}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Tag className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground w-24 shrink-0">Category</span>
                <span className="text-foreground">{categoryLabels[category]}</span>
              </div>
            </div>
          </div>

          {/* Actor */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Actor</p>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{log.actor.user_name}</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs pl-6">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-foreground">{log.actor.user_id}</span>
                <span className="text-muted-foreground">Tenant</span>
                <span className="text-foreground">{log.actor.tenant_name}</span>
                <span className="text-muted-foreground">Tenant ID</span>
                <span className="font-mono text-foreground">{log.actor.tenant_id}</span>
              </div>
            </div>
          </div>

          {/* Tenant */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tenant</p>
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{log.tenant.tenant_name}</span>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs pl-6">
                <span className="text-muted-foreground">Tenant ID</span>
                <span className="font-mono text-foreground">{log.tenant.tenant_id}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          {Object.keys(log.details).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</p>
                <CopyButton text={JSON.stringify(log.details, null, 2)} />
              </div>
              <div className="rounded-lg border border-border bg-muted/30 divide-y divide-border/50">
                {Object.entries(log.details).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-3 py-2 text-xs gap-3">
                    <span className="text-muted-foreground font-medium shrink-0">{k.replace(/_/g, " ")}</span>
                    <span className="font-mono text-foreground text-right break-all">{String(v)}</span>
                  </div>
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

export const WorkspaceLogsSection = () => {
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
    setTimeout(() => setLogs((prev) => prev.map((l) => l._id === entry._id ? { ...l, isNew: false } : l)), 1500);
  }, []);

  useEffect(() => {
    if (isLive && !isPaused) intervalRef.current = setInterval(tick, 3500);
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isLive, isPaused, tick]);

  const filtered = useMemo(() => logs.filter((log) => {
    if (levels.size > 0 && !levels.has(log.level)) return false;
    const cat = deriveCategory(log.event_type);
    if (categories.size > 0 && !categories.has(cat)) return false;
    if (dateRange?.from) {
      const d = new Date(log.occurred_at);
      const from = startOfDay(dateRange.from);
      const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
      if (!isWithinInterval(d, { start: from, end: to })) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        log.event_type.toLowerCase().includes(q) ||
        log.actor.user_name.toLowerCase().includes(q) ||
        Object.values(log.details).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return true;
  }), [logs, levels, categories, dateRange, search]);

  const levelCounts = useMemo(() => {
    const c: Record<LogLevel, number> = { info: 0, success: 0, warning: 0, error: 0 };
    logs.forEach((l) => c[l.level]++);
    return c;
  }, [logs]);

  const toggleLevel = (l: LogLevel) => setLevels((p) => { const n = new Set(p); n.has(l) ? n.delete(l) : n.add(l); return n; });
  const toggleCategory = (c: LogCategory) => setCategories((p) => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });
  const hasFilters = levels.size > 0 || categories.size > 0 || !!dateRange || !!search;
  const clearFilters = () => { setLevels(new Set()); setCategories(new Set()); setDateRange(undefined); setSearch(""); };

  const exportJSON = () => {
    const content = JSON.stringify(filtered, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    a.download = `workspace-logs-${format(new Date(), "yyyy-MM-dd")}.json`;
    a.click();
  };

  const dateLabel = dateRange?.from
    ? dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      : format(dateRange.from, "MMM d, yyyy")
    : "Date range";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border/40">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground">Workspace Logs</h3>
            {isLive && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
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
            <Button variant="outline" size="sm" onClick={() => { setIsLive((v) => !v); setIsPaused(false); }}
              className={cn("h-7 gap-1.5 text-xs", isLive ? "text-destructive border-destructive/30 hover:bg-destructive/5" : "text-success border-success/30 hover:bg-success/5")}>
              <Radio className="w-3 h-3" />{isLive ? "Disconnect" : "Go Live"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportJSON} className="h-7 gap-1.5 text-xs">
              <Download className="w-3 h-3" />Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-border/40 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search event type, actor, details…" className="pl-8 h-7 text-xs" />
          </div>

          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-7 gap-1.5 text-xs font-normal", dateRange && "border-primary/40 text-primary")}>
                <CalendarIcon className="w-3 h-3" />{dateLabel}
                {dateRange && <span onClick={(e) => { e.stopPropagation(); setDateRange(undefined); }}><X className="w-3 h-3 ml-0.5 hover:text-destructive" /></span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} disabled={(d) => d > new Date()} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-1">
            {ALL_LEVELS.map((l) => {
              const { icon: Icon, badge } = levelConfig[l];
              return (
                <button key={l} onClick={() => toggleLevel(l)}
                  className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-xs border transition-colors", levels.has(l) ? badge : "border-border/50 text-muted-foreground hover:bg-accent")}>
                  <Icon className="w-3 h-3" />{levelConfig[l].label} <span className="font-mono">{levelCounts[l]}</span>
                </button>
              );
            })}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-7 gap-1.5 text-xs", categories.size > 0 && "border-primary/40 text-primary")}>
                <Filter className="w-3 h-3" />{categories.size > 0 ? `${categories.size} categories` : "Category"}<ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                {ALL_CATEGORIES.map((c) => (
                  <button key={c} onClick={() => toggleCategory(c)}
                    className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors", categories.has(c) ? "bg-primary/10 text-primary" : "hover:bg-accent text-foreground")}>
                    {categoryLabels[c]}{categories.has(c) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 gap-1 text-xs text-muted-foreground">
              <X className="w-3 h-3" />Clear
            </Button>
          )}
        </div>

        {/* Column header */}
        <div className="grid grid-cols-[24px_1fr_130px_80px] gap-3 px-4 py-2 border-b border-border/40 bg-muted/20">
          <div />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Event</span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Actor</span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Time</span>
        </div>

        {/* Log rows */}
        <div className="divide-y divide-border/30">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No log entries match your filters.</div>
          ) : (
            filtered.map((log) => {
              const { icon: LevelIcon, badge, row } = levelConfig[log.level];
              const cat = deriveCategory(log.event_type);
              return (
                <button key={log._id} onClick={() => { setSelectedLog(log); setDrawerOpen(true); }}
                  className={cn("w-full text-left grid grid-cols-[24px_1fr_130px_80px] gap-3 items-center px-4 py-3 hover:bg-accent/40 transition-colors group", log.isNew && "bg-success/5", row)}>
                  <LevelIcon className="w-4 h-4 shrink-0 opacity-70" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{formatEventType(log.event_type)}</span>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0 border", badge)}>{categoryLabels[cat]}</Badge>
                    </div>
                    {Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">
                        {Object.entries(log.details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join("  ·  ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{log.actor.user_name}</span>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs text-muted-foreground font-mono opacity-70">{formatShort(log.occurred_at)}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} of {logs.length} entries</span>
          {isLive && !isPaused && <span className="text-xs text-muted-foreground">Streaming every 3.5s</span>}
        </div>
      </div>

      <LogDetailDrawer log={selectedLog} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
};
