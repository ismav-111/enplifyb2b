import { useState, useMemo } from "react";
import { Search, RefreshCw, Download, CheckCircle2, AlertTriangle, XCircle, Info, ChevronDown, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LogLevel = "info" | "success" | "warning" | "error";
type LogCategory = "sync" | "auth" | "query" | "system" | "user";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: string;
  source?: string;
}

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2024-03-17 14:32:05",
    level: "success",
    category: "sync",
    message: "Salesforce sync completed successfully",
    details: "Synced 1,248 records in 12.4s. Updated: 842, New: 406, Skipped: 0.",
    source: "Salesforce CRM",
  },
  {
    id: "2",
    timestamp: "2024-03-17 14:31:50",
    level: "info",
    category: "sync",
    message: "Salesforce sync started",
    details: "Initiating full refresh for Salesforce CRM connector.",
    source: "Salesforce CRM",
  },
  {
    id: "3",
    timestamp: "2024-03-17 13:58:21",
    level: "warning",
    category: "query",
    message: "Slow query detected on Snowflake data source",
    details: "Query took 18.2s to execute. Consider optimizing filters or adding an index.",
    source: "Snowflake Analytics",
  },
  {
    id: "4",
    timestamp: "2024-03-17 13:45:10",
    level: "error",
    category: "sync",
    message: "OneDrive sync failed — authentication token expired",
    details: "OAuth token expired. Re-authenticate the OneDrive connector to resume sync.",
    source: "OneDrive",
  },
  {
    id: "5",
    timestamp: "2024-03-17 13:20:00",
    level: "info",
    category: "user",
    message: "User alice@acme.com joined the workspace",
    details: "Role assigned: Editor.",
    source: "User Management",
  },
  {
    id: "6",
    timestamp: "2024-03-17 12:55:44",
    level: "success",
    category: "query",
    message: "AI query answered with 6 sources",
    details: "Query: 'What were Q1 revenue drivers?' — 6 document chunks retrieved, response generated in 3.1s.",
    source: "Query Engine",
  },
  {
    id: "7",
    timestamp: "2024-03-17 12:30:12",
    level: "info",
    category: "system",
    message: "Guardrails policy updated",
    details: "System prompt updated by admin@acme.com.",
    source: "System",
  },
  {
    id: "8",
    timestamp: "2024-03-17 11:48:30",
    level: "success",
    category: "sync",
    message: "Google Drive sync completed",
    details: "Synced 312 files. Updated: 78, New: 234, Removed: 0.",
    source: "Google Drive",
  },
  {
    id: "9",
    timestamp: "2024-03-17 11:20:05",
    level: "warning",
    category: "auth",
    message: "Failed login attempt for workspace",
    details: "3 consecutive failed attempts from IP 192.168.1.104. User: bob@acme.com.",
    source: "Auth",
  },
  {
    id: "10",
    timestamp: "2024-03-17 10:55:00",
    level: "error",
    category: "sync",
    message: "ServiceNow connector returned 403 Forbidden",
    details: "Check API key permissions. The key may lack read access to the incidents table.",
    source: "ServiceNow",
  },
  {
    id: "11",
    timestamp: "2024-03-17 10:30:18",
    level: "info",
    category: "user",
    message: "User carol@acme.com removed from workspace",
    source: "User Management",
  },
  {
    id: "12",
    timestamp: "2024-03-17 09:15:44",
    level: "success",
    category: "auth",
    message: "SSO authentication successful",
    details: "User dave@acme.com authenticated via SAML SSO.",
    source: "Auth",
  },
];

const levelConfig: Record<LogLevel, { icon: React.ComponentType<{ className?: string }>; label: string; badgeClass: string; textClass: string }> = {
  success: { icon: CheckCircle2, label: "Success", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", textClass: "text-emerald-600" },
  info:    { icon: Info,          label: "Info",    badgeClass: "bg-primary/10 text-primary border-primary/20",                 textClass: "text-primary" },
  warning: { icon: AlertTriangle, label: "Warning", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",           textClass: "text-amber-600" },
  error:   { icon: XCircle,       label: "Error",   badgeClass: "bg-destructive/10 text-destructive border-destructive/20",     textClass: "text-destructive" },
};

const categoryLabels: Record<LogCategory, string> = {
  sync: "Sync", auth: "Auth", query: "Query", system: "System", user: "User",
};

const ALL_LEVELS: LogLevel[]    = ["info", "success", "warning", "error"];
const ALL_CATEGORIES: LogCategory[] = ["sync", "auth", "query", "system", "user"];

export const WorkspaceLogsSection = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return mockLogs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) return false;
      if (categoryFilter !== "all" && log.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.message.toLowerCase().includes(q) ||
          (log.details?.toLowerCase().includes(q) ?? false) ||
          (log.source?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [search, levelFilter, categoryFilter]);

  const handleRefresh = () => {
    // placeholder — would re-fetch logs in a real implementation
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Activity Logs</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time events for syncs, queries, users, and system actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search logs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLevelFilter("all")}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
              levelFilter === "all"
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:bg-accent"
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
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                  levelFilter === lvl ? cfg.badgeClass : "border-border text-muted-foreground hover:bg-accent"
                )}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                categoryFilter === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-accent"
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
          <div className="py-16 text-center text-sm text-muted-foreground">
            No log entries match your filters.
          </div>
        ) : (
          filtered.map((log) => {
            const cfg = levelConfig[log.level];
            const Icon = cfg.icon;
            const isExpanded = expandedId === log.id;

            return (
              <div
                key={log.id}
                className={cn("group bg-card transition-colors", log.details && "cursor-pointer hover:bg-accent/40")}
                onClick={() => log.details && setExpandedId(isExpanded ? null : log.id)}
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.textClass)} />

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground leading-snug">
                        {log.message}
                      </span>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 leading-5 font-medium", cfg.badgeClass)}>
                        {cfg.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 leading-5 font-medium text-muted-foreground">
                        {categoryLabels[log.category]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{log.timestamp}</span>
                      {log.source && <span>· {log.source}</span>}
                    </div>

                    {isExpanded && log.details && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-md px-3 py-2 border border-border animate-in fade-in slide-in-from-top-1 duration-150">
                        {log.details}
                      </p>
                    )}
                  </div>

                  {log.details && (
                    <div className="shrink-0 mt-0.5">
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Showing {filtered.length} of {mockLogs.length} entries
      </p>
    </div>
  );
};
