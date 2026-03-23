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
  ArrowUpRight,
  Search,
  Download,
  CalendarDays,
  ChevronDown,
  Zap,
  TrendingUp,
} from "lucide-react";
import { format, subDays, isWithinInterval, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";

// ─── License data ────────────────────────────────────────────────────────────

const licenseData = {
  plan: "Enterprise",
  tenantName: "Quadrant Technologies",
  licenseKey: "ENT-XXXX-XXXX-XXXX-XXXX",
  startDate: "Jan 1, 2025",
  renewalDate: "Dec 31, 2025",
  daysUntilRenewal: 283,
  supportTier: "Priority",
  includedQueries: 150_000,
  usedQueries: 84_230,
  onDemandEnabled: false,
};

// ─── Usage metric cards ───────────────────────────────────────────────────────

interface UsageMetric {
  label: string;
  used: number;
  total: number;
  unit: string;
  icon: React.ElementType;
  warnAt?: number;
}

const usageMetrics: UsageMetric[] = [
  { label: "Active Seats", used: 34, total: 50, unit: "seats", icon: Users, warnAt: 90 },
  { label: "Storage Used", used: 148, total: 500, unit: "GB", icon: HardDrive, warnAt: 85 },
  { label: "Data Sources", used: 7, total: 20, unit: "sources", icon: Database },
  { label: "Queries (Month)", used: 84_230, total: 150_000, unit: "queries", icon: MessageSquare, warnAt: 80 },
];

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function UsageCard({ metric }: { metric: UsageMetric }) {
  const pct = Math.round((metric.used / metric.total) * 100);
  const isWarning = metric.warnAt !== undefined && pct >= metric.warnAt;
  const Icon = metric.icon;
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-muted">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{metric.label}</span>
      </div>
      <Progress value={pct} className={`h-1.5 ${isWarning ? "[&>div]:bg-destructive" : ""}`} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{formatNumber(metric.used)}</span>
          {" "}/ {formatNumber(metric.total)} {metric.unit}
        </span>
        <span className={isWarning ? "text-destructive font-semibold" : ""}>{pct}%</span>
      </div>
    </div>
  );
}

// ─── Query usage table data ───────────────────────────────────────────────────

interface QueryRecord {
  id: string;
  date: string; // ISO string
  user: string;
  type: "Included" | "On-Demand";
  model: string;
  tokens: number;
  cost: string;
  workspace: string;
}

const AI_MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "claude-3.5-sonnet",
  "claude-3-opus",
  "gemini-1.5-pro",
  "llama-3-70b",
];

const USERS = [
  "anand.komati@quadranttechnologies.com",
  "poc@quadranttechnologies.com",
  "sarah.chen@quadranttechnologies.com",
  "raj.patel@quadranttechnologies.com",
  "admin@quadranttechnologies.com",
];

const WORKSPACES = ["test", "production", "analytics", "support"];

function generateQueryRecords(): QueryRecord[] {
  const records: QueryRecord[] = [];
  const now = new Date("2026-03-23T12:00:00Z");
  const tokenOptions = [
    33_200, 54_700, 98_900, 116_800, 125_900, 128_100, 182_300,
    256_300, 310_500, 378_100, 394_800, 442_600, 67_400, 220_100,
    88_500, 145_000, 4_400_000,
  ];

  for (let i = 0; i < 80; i++) {
    const offsetMinutes = i * 47 + Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - offsetMinutes * 60 * 1000);
    const tokens = tokenOptions[i % tokenOptions.length];
    const model = AI_MODELS[i % AI_MODELS.length];
    const user = USERS[i % USERS.length];
    records.push({
      id: `q-${i}`,
      date: date.toISOString(),
      user,
      type: "Included",
      model,
      tokens,
      cost: "Included",
      workspace: WORKSPACES[i % WORKSPACES.length],
    });
  }
  return records;
}

const ALL_RECORDS = generateQueryRecords();

// ─── Date range presets ───────────────────────────────────────────────────────

type Preset = "1d" | "7d" | "30d" | "custom";

function getPresetRange(preset: Preset): DateRange {
  const now = new Date();
  if (preset === "1d") return { from: subDays(now, 1), to: now };
  if (preset === "7d") return { from: subDays(now, 7), to: now };
  return { from: subDays(now, 30), to: now };
}

// ─── Main component ───────────────────────────────────────────────────────────

export const LicenseUsageSection = () => {
  const [preset, setPreset] = useState<Preset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [calOpen, setCalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dateRange: DateRange = preset === "custom" && customRange ? customRange : getPresetRange(preset);

  const filteredRecords = useMemo(() => {
    return ALL_RECORDS.filter((r) => {
      const date = parseISO(r.date);
      const inRange =
        dateRange.from && dateRange.to
          ? isWithinInterval(date, { start: dateRange.from, end: dateRange.to })
          : true;
      const matchesSearch =
        !search ||
        r.user.toLowerCase().includes(search.toLowerCase()) ||
        r.model.toLowerCase().includes(search.toLowerCase()) ||
        r.workspace.toLowerCase().includes(search.toLowerCase());
      return inRange && matchesSearch;
    });
  }, [dateRange, search]);

  const totalTokens = filteredRecords.reduce((sum, r) => sum + r.tokens, 0);

  const handleExportCSV = () => {
    const headers = ["Date", "User", "Workspace", "Type", "Model", "Tokens", "Cost"];
    const rows = filteredRecords.map((r) => [
      format(parseISO(r.date), "MMM d, HH:mm"),
      r.user,
      r.workspace,
      r.type,
      r.model,
      r.tokens.toLocaleString(),
      r.cost,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "query-usage.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const includedPct = Math.round((licenseData.usedQueries / licenseData.includedQueries) * 100);

  return (
    <div className="space-y-8">
      {/* ── Top summary row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Included usage */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-xs text-muted-foreground">Your included usage</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground">
              {formatNumber(licenseData.usedQueries)}
            </span>
            <span className="text-2xl font-light text-muted-foreground">
              / {formatNumber(licenseData.includedQueries)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">queries</span>
          </div>
          <Progress
            value={includedPct}
            className={`h-2 ${includedPct >= 80 ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
          />
          <p className="text-xs text-muted-foreground">
            Resets{" "}
            <span className="font-medium text-foreground">Apr 1, 2026</span>
          </p>
        </div>

        {/* On-demand usage */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-xs text-muted-foreground">On-Demand Usage (Tenant)</p>
          <p className="text-2xl font-bold text-foreground">Off</p>
          <p className="text-sm text-muted-foreground">
            Pay for extra usage beyond your plan limits.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7">
              Set Limit
            </Button>
            <span className="text-xs text-muted-foreground">Off</span>
          </div>
        </div>
      </div>

      {/* ── Plan + features ── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">{licenseData.plan}</span>
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 text-[11px]">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{licenseData.tenantName}</p>
            <p className="text-xs font-mono text-muted-foreground">{licenseData.licenseKey}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Valid From", value: licenseData.startDate, icon: CalendarDays },
            { label: "Renews On", value: licenseData.renewalDate, icon: CalendarDays },
            { label: "Days Left", value: `${licenseData.daysUntilRenewal} days`, icon: Zap },
            { label: "Support", value: licenseData.supportTier, icon: ShieldCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="space-y-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Included Features
          </p>
          <div className="flex flex-wrap gap-2">
            {["Unlimited Workspaces","SSO / SAML","Audit Logs","Guardrails","Priority Support","Custom Data Sources","Role-Based Access","API Access"].map((f) => (
              <Badge key={f} variant="secondary" className="text-xs font-normal">{f}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resource metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {usageMetrics.map((m) => <UsageCard key={m.label} metric={m} />)}
      </div>

      {/* ── Detailed query stats ── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Query Usage</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Per-query token breakdown across all workspaces
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date range picker */}
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
                onSelect={(r) => {
                  setCustomRange(r);
                  setPreset("custom");
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Preset buttons */}
          {(["1d", "7d", "30d"] as Preset[]).map((p) => (
            <Button
              key={p}
              variant={preset === p ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => { setPreset(p); setCustomRange(undefined); }}
            >
              {p}
            </Button>
          ))}

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user, model, workspace…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>

          {/* Export */}
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 ml-auto" onClick={handleExportCSV}>
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>

        {/* Summary strip */}
        <div className="flex items-center gap-6 px-4 py-2.5 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{filteredRecords.length}</span> queries
          </span>
          <span>
            <span className="font-semibold text-foreground">{formatNumber(totalTokens)}</span> total tokens
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <TrendingUp className="w-3.5 h-3.5" />
            <span><span className="font-semibold text-foreground">+7.6%</span> vs last period</span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-40">Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Workspace</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Type</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-44">Model</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28 text-right">Tokens</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.slice(0, 50).map((r) => (
                <TableRow key={r.id} className="text-sm">
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {format(parseISO(r.date), "MMM d, HH:mm a")}
                  </TableCell>
                  <TableCell className="text-xs max-w-[200px] truncate text-foreground" title={r.user}>
                    {r.user}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground capitalize">{r.workspace}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[11px] font-normal text-primary border-primary/30 bg-primary/10"
                    >
                      {r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-foreground">{r.model}</TableCell>
                  <TableCell className="text-xs text-right tabular-nums">
                    <span className={r.tokens > 300_000 ? "text-destructive font-semibold" : "text-foreground"}>
                      {r.tokens >= 1_000_000
                        ? `${(r.tokens / 1_000_000).toFixed(1)}M`
                        : `${(r.tokens / 1_000).toFixed(1)}K`}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">{r.cost}</TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-10">
                    No queries found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {filteredRecords.length > 50 && (
          <p className="text-xs text-muted-foreground text-center">
            Showing 50 of {filteredRecords.length} records. Export CSV to view all.
          </p>
        )}
      </section>
    </div>
  );
};
