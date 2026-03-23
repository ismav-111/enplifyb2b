import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Users,
  HardDrive,
  MessageSquare,
  Database,
  CalendarDays,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

interface UsageMetric {
  label: string;
  used: number;
  total: number;
  unit: string;
  icon: React.ElementType;
  warnAt?: number; // percentage threshold
}

const licenseData = {
  plan: "Enterprise",
  status: "active" as const,
  tenantName: "Quadrant Technologies",
  tenantId: "784dbf7f-daf0-4b53-8b83-f6e55147463e",
  licenseKey: "ENT-XXXX-XXXX-XXXX-XXXX",
  startDate: "Jan 1, 2025",
  renewalDate: "Dec 31, 2025",
  daysUntilRenewal: 283,
  supportTier: "Priority",
  ssoEnabled: true,
  auditLogsEnabled: true,
  guardrailsEnabled: true,
  maxWorkspaces: "Unlimited",
};

const usageMetrics: UsageMetric[] = [
  {
    label: "Queries This Month",
    used: 84_230,
    total: 150_000,
    unit: "queries",
    icon: MessageSquare,
    warnAt: 80,
  },
  {
    label: "Active Seats",
    used: 34,
    total: 50,
    unit: "seats",
    icon: Users,
    warnAt: 90,
  },
  {
    label: "Storage Used",
    used: 148,
    total: 500,
    unit: "GB",
    icon: HardDrive,
    warnAt: 85,
  },
  {
    label: "Data Sources Connected",
    used: 7,
    total: 20,
    unit: "sources",
    icon: Database,
  },
];

const monthlyQueryTrend = [
  { month: "Oct", queries: 61_400 },
  { month: "Nov", queries: 72_800 },
  { month: "Dec", queries: 68_100 },
  { month: "Jan", queries: 79_500 },
  { month: "Feb", queries: 91_200 },
  { month: "Mar", queries: 84_230 },
];

const maxTrend = Math.max(...monthlyQueryTrend.map((m) => m.queries));

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
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{metric.label}</span>
        </div>
        {isWarning && (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        )}
      </div>

      <div className="space-y-1.5">
        <Progress
          value={pct}
          className={`h-2 ${isWarning ? "[&>div]:bg-amber-500" : ""}`}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">
              {formatNumber(metric.used)}
            </span>{" "}
            / {formatNumber(metric.total)} {metric.unit}
          </span>
          <span className={isWarning ? "text-warning font-medium" : ""}>
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

export const LicenseUsageSection = () => {
  return (
    <div className="space-y-10">
      {/* Plan Overview */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">License</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your current plan, entitlements, and renewal details
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-xl font-bold text-foreground">
                  {licenseData.plan}
                </span>
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-600/30 bg-emerald-600/10 text-[11px]"
                >
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {licenseData.tenantName}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {licenseData.licenseKey}
              </p>
            </div>

            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              Upgrade Plan
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Valid From", value: licenseData.startDate, icon: CalendarDays },
              { label: "Renews On", value: licenseData.renewalDate, icon: CalendarDays },
              { label: "Days Left", value: `${licenseData.daysUntilRenewal} days`, icon: Zap },
              { label: "Support Tier", value: licenseData.supportTier, icon: ShieldCheck },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Included Features
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Unlimited Workspaces",
                "SSO / SAML",
                "Audit Logs",
                "Guardrails",
                "Priority Support",
                "Custom Data Sources",
                "Role-Based Access",
                "API Access",
              ].map((feature) => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Usage Metrics */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Usage</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Current billing cycle consumption across your tenant
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {usageMetrics.map((metric) => (
            <UsageCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      {/* Query Trend */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Query Trend</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monthly query volume over the last 6 months
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-end gap-3 h-36">
            {monthlyQueryTrend.map((item) => {
              const heightPct = (item.queries / maxTrend) * 100;
              const isCurrent = item.month === "Mar";
              return (
                <div
                  key={item.month}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full relative flex items-end" style={{ height: "100px" }}>
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isCurrent
                          ? "bg-primary"
                          : "bg-muted group-hover:bg-muted-foreground/30"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-popover border border-border rounded px-2 py-1 text-[11px] text-foreground whitespace-nowrap shadow-sm z-10">
                      {formatNumber(item.queries)}
                    </div>
                  </div>
                  <span className={`text-xs ${isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>
                <span className="font-semibold text-foreground">+7.6%</span> vs last month
              </span>
            </div>
            <span className="text-muted-foreground text-xs">
              Billing cycle resets <span className="font-medium text-foreground">Apr 1, 2026</span>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
