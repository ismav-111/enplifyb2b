import { useState, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Users,
  HardDrive,
  MessageSquare,
  Database,
  ShieldCheck,
  Search,
  Download,
  CalendarDays,
  ChevronDown,
  Zap,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

// ─── License data ─────────────────────────────────────────────────────────────

const licenseData = {
  plan: "Enterprise",
  tenantName: "Quadrant Technologies",
  licenseKey: "ENT-2025-QTECH-7F4D-A3C1",
  startDate: "Jan 1, 2025",
  renewalDate: "Dec 31, 2025",
  daysUntilRenewal: 283,
  supportTier: "Priority",
  includedQueries: 150_000,
  usedQueries: 84_230,
};

// ─── Usage metrics ────────────────────────────────────────────────────────────

interface UsageMetric {
  label: string;
  used: number;
  total: number;
  unit: string;
  icon: React.ElementType;
  warnAt?: number;
}

const usageMetrics: UsageMetric[] = [
  { label: "Active Seats",     used: 34,      total: 50,       unit: "seats",   icon: Users,         warnAt: 90 },
  { label: "Storage",          used: 148,     total: 500,      unit: "GB",      icon: HardDrive,     warnAt: 85 },
  { label: "Data Sources",     used: 7,       total: 20,       unit: "sources", icon: Database },
  { label: "Queries (Month)",  used: 84_230,  total: 150_000,  unit: "queries", icon: MessageSquare, warnAt: 80 },
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ─── Query records ────────────────────────────────────────────────────────────

interface QueryRecord {
  id: string;
  date: string;
  user: string;
  workspace: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  status: "success" | "error" | "timeout";
}

const AI_MODELS  = ["gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet", "claude-3-opus", "gemini-1.5-pro", "llama-3-70b"];
const USERS      = ["anand.komati", "poc.admin", "sarah.chen", "raj.patel", "admin"];
const WORKSPACES = ["test", "production", "analytics", "support"];

function generateQueryRecords(): QueryRecord[] {
  const records: QueryRecord[] = [];
  const now = new Date("2026-03-23T12:00:00Z");
  const promptOptions     = [8_200, 14_500, 22_300, 31_800, 48_600, 62_900, 88_000, 120_400, 145_000, 198_000];
  const completionOptions = [4_100,  7_200, 11_600, 16_400, 25_200, 34_000, 48_500,  62_000,  78_000, 104_000];
  const latencyOptions    = [420, 610, 820, 1050, 1340, 1760, 2200, 2900, 3400, 4200];
  const statuses: Array<"success" | "error" | "timeout"> = ["success", "success", "success", "success", "success", "success", "success", "error", "success", "timeout"];

  for (let i = 0; i < 120; i++) {
    const offsetMin = i * 38 + Math.floor(Math.random() * 20);
    const date      = new Date(now.getTime() - offsetMin * 60 * 1000);
    const prompt    = promptOptions[i % promptOptions.length];
    const completion = completionOptions[i % completionOptions.length];
    records.push({
      id:               `q-${i}`,
      date:             date.toISOString(),
      user:             USERS[i % USERS.length],
      workspace:        WORKSPACES[i % WORKSPACES.length],
      model:            AI_MODELS[i % AI_MODELS.length],
      promptTokens:     prompt,
      completionTokens: completion,
      totalTokens:      prompt + completion,
      latencyMs:        latencyOptions[i % latencyOptions.length],
      status:           statuses[i % statuses.length],
    });
  }
  return records;
}

const ALL_RECORDS = generateQueryRecords();

// ─── Date presets ─────────────────────────────────────────────────────────────

type Preset = "1d" | "7d" | "30d" | "custom";

function getPresetRange(p: Preset): DateRange {
  const now = new Date();
  if (p === "1d") return { from: subDays(now, 1),  to: now };
  if (p === "7d") return { from: subDays(now, 7),  to: now };
  return             { from: subDays(now, 30), to: now };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ metric }: { metric: UsageMetric }) {
  const pct  = Math.round((metric.used / metric.total) * 100);
  const warn = metric.warnAt !== undefined && pct >= metric.warnAt;
  const Icon = metric.icon;
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{metric.label}</span>
        </div>
        <span className={cn("text-xs font-semibold tabular-nums", warn ? "text-destructive" : "text-muted-foreground")}>
          {pct}%
        </span>
      </div>
      <div>
        <p className="text-xl font-bold text-foreground tabular-nums">
          {fmt(metric.used)}
          <span className="text-sm font-normal text-muted-foreground ml-1">/ {fmt(metric.total)} {metric.unit}</span>
        </p>
      </div>
      <Progress
        value={pct}
        className={cn("h-1.5", warn ? "[&>div]:bg-destructive" : "")}
      />
    </div>
  );
}

const statusConfig: Record<"success" | "error" | "timeout", { label: string; classes: string }> = {
  success: { label: "Success", classes: "bg-primary/10 text-primary border-primary/20" },
  error:   { label: "Error",   classes: "bg-destructive/10 text-destructive border-destructive/20" },
  timeout: { label: "Timeout", classes: "bg-muted text-muted-foreground border-border" },
};

// ─── Main component ───────────────────────────────────────────────────────────

export const LicenseUsageSection = () => {
  const [preset,      setPreset]      = useState<Preset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [calOpen,     setCalOpen]     = useState(false);
  const [search,      setSearch]      = useState("");
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 20;

  const dateRange: DateRange = preset === "custom" && customRange ? customRange : getPresetRange(preset);

  const filteredRecords = useMemo(() => {
    return ALL_RECORDS.filter((r) => {
      const d       = parseISO(r.date);
      const inRange = dateRange.from && dateRange.to
        ? isWithinInterval(d, { start: dateRange.from, end: dateRange.to })
        : true;
      const q = search.toLowerCase();
      const matches = !search
        || r.user.toLowerCase().includes(q)
        || r.model.toLowerCase().includes(q)
        || r.workspace.toLowerCase().includes(q);
      return inRange && matches;
    });
  }, [dateRange, search]);

  const totalTokens   = filteredRecords.reduce((s, r) => s + r.totalTokens, 0);
  const avgLatency    = filteredRecords.length
    ? Math.round(filteredRecords.reduce((s, r) => s + r.latencyMs, 0) / filteredRecords.length)
    : 0;
  const errorCount    = filteredRecords.filter(r => r.status !== "success").length;
  const totalPages    = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const pageRecords   = filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    const headers = ["Date", "User", "Workspace", "Model", "Prompt Tokens", "Completion Tokens", "Total Tokens", "Latency (ms)", "Status"];
    const rows    = filteredRecords.map((r) => [
      format(parseISO(r.date), "yyyy-MM-dd HH:mm"),
      r.user, r.workspace, r.model,
      r.promptTokens, r.completionTokens, r.totalTokens, r.latencyMs, r.status,
    ]);
    const csv  = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "query-usage.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const includedPct = Math.round((licenseData.usedQueries / licenseData.includedQueries) * 100);

  return (
    <div className="space-y-8">

      {/* ── Plan overview ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">{licenseData.plan}</h2>
                <Badge className="text-[11px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/10">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{licenseData.tenantName}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          {[
            { label: "License Key",  value: licenseData.licenseKey,          mono: true },
            { label: "Valid From",   value: licenseData.startDate,            mono: false },
            { label: "Renews On",    value: licenseData.renewalDate,          mono: false },
            { label: "Support Tier", value: licenseData.supportTier,          mono: false },
          ].map(({ label, value, mono }) => (
            <div key={label} className="px-5 py-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
              <p className={cn("text-sm font-medium text-foreground truncate", mono && "font-mono text-xs")}>{value}</p>
            </div>
          ))}
        </div>

        {/* Included features */}
        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Included Features</p>
          <div className="flex flex-wrap gap-1.5">
            {["Unlimited Workspaces", "SSO / SAML", "Audit Logs", "Guardrails", "Priority Support", "Custom Data Sources", "Role-Based Access", "API Access"].map(f => (
              <Badge key={f} variant="secondary" className="text-xs font-normal">{f}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Query quota ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Included Queries</p>
            <span className="text-xs text-muted-foreground">Resets Apr 1, 2026</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground tabular-nums">{fmt(licenseData.usedQueries)}</span>
            <span className="text-base text-muted-foreground">/ {fmt(licenseData.includedQueries)}</span>
          </div>
          <Progress
            value={includedPct}
            className={cn("h-2", includedPct >= 80 ? "[&>div]:bg-destructive" : "")}
          />
          <p className="text-xs text-muted-foreground">{includedPct}% of monthly quota used</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">On-Demand Usage</p>
            <Badge variant="outline" className="text-[11px]">Disabled</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">$0.00</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enable on-demand to continue querying after your included quota is exhausted. Billed per 1K tokens beyond plan limits.
          </p>
          <Button variant="outline" size="sm" className="text-xs h-8">Enable On-Demand</Button>
        </div>
      </div>

      {/* ── Resource metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {usageMetrics.map(m => <MetricCard key={m.label} metric={m} />)}
      </div>

      {/* ── Query token stats ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Query Token Usage</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Detailed per-query breakdown — prompt, completion, latency, and status</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range */}
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" />
                {dateRange.from && dateRange.to
                  ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                  : "Select range"}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={customRange}
                onSelect={(r) => { setCustomRange(r); setPreset("custom"); setPage(1); }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {(["1d", "7d", "30d"] as Preset[]).map(p => (
            <Button
              key={p}
              variant={preset === p ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => { setPreset(p); setCustomRange(undefined); setPage(1); }}
            >
              {p}
            </Button>
          ))}

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user, model, workspace…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="h-8 text-xs pl-8"
            />
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Queries",  value: filteredRecords.length.toLocaleString(), icon: MessageSquare },
            { label: "Total Tokens",   value: fmt(totalTokens),                        icon: Zap },
            { label: "Avg Latency",    value: `${avgLatency} ms`,                      icon: TrendingUp },
            { label: "Errors / Timeouts", value: errorCount.toString(),                icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-muted shrink-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold truncate">{label}</p>
                <p className="text-base font-bold text-foreground tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-36">Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Workspace</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-40">Model</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 text-right">Prompt</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 text-right">Completion</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 text-right">Total</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right">Latency</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-20 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRecords.map(r => {
                const sc = statusConfig[r.status];
                return (
                  <TableRow key={r.id} className="text-sm">
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {format(parseISO(r.date), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs text-foreground font-medium max-w-[160px] truncate" title={r.user}>
                      {r.user}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground capitalize">{r.workspace}</TableCell>
                    <TableCell className="text-xs font-mono text-foreground">{r.model}</TableCell>
                    <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                      {fmt(r.promptTokens)}
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                      {fmt(r.completionTokens)}
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums font-semibold text-foreground">
                      {fmt(r.totalTokens)}
                    </TableCell>
                    <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                      {r.latencyMs} ms
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border", sc.classes)}>
                        {sc.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-12">
                    No queries found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRecords.length)} of {filteredRecords.length} records
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm" className="h-7 text-xs"
                disabled={page === 1} onClick={() => setPage(p => p - 1)}
              >Prev</Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = i + 1;
                return (
                  <Button
                    key={n}
                    variant={page === n ? "default" : "outline"}
                    size="sm"
                    className="h-7 w-7 text-xs p-0"
                    onClick={() => setPage(n)}
                  >{n}</Button>
                );
              })}
              <Button
                variant="outline" size="sm" className="h-7 text-xs"
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              >Next</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
