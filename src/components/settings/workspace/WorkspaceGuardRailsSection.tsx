import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Pencil, Trash2, Shield } from "lucide-react";

interface GuardRailRule {
  id: string;
  name: string;
  scope: "universal" | "workspace";
  category: "pii" | "security" | "topic" | "content";
  enabled: boolean;
  patterns: string[];
  responseMessage: string;
  action: "BLOCK" | "WARN" | "REDACT";
  priority: number;
}

const systemRules: GuardRailRule[] = [
  {
    id: "block_ssn",
    name: "Block Social Security Numbers",
    scope: "universal",
    category: "pii",
    enabled: true,
    patterns: ["\\d{3}-\\d{2}-\\d{4}", "ssn"],
    responseMessage: "Requests containing SSN patterns are blocked",
    action: "BLOCK",
    priority: 10,
  },
  {
    id: "redact_api_keys",
    name: "Redact API Keys",
    scope: "universal",
    category: "security",
    enabled: true,
    patterns: ["sk_live_", "api_key", "secret_"],
    responseMessage: "Sensitive tokens detected and redacted",
    action: "WARN",
    priority: 7,
  },
  {
    id: "block_credit_card",
    name: "Block Credit Card Numbers",
    scope: "universal",
    category: "pii",
    enabled: true,
    patterns: ["\\d{4}-\\d{4}-\\d{4}-\\d{4}"],
    responseMessage: "Credit card patterns are not allowed",
    action: "BLOCK",
    priority: 9,
  },
];

const organizationRules: GuardRailRule[] = [
  {
    id: "finance_data",
    name: "Finance Data Protection",
    scope: "workspace",
    category: "topic",
    enabled: false,
    patterns: [],
    responseMessage: "Do not disclose internal financial data",
    action: "BLOCK",
    priority: 5,
  },
  {
    id: "competitor_mentions",
    name: "Competitor Information",
    scope: "workspace",
    category: "content",
    enabled: true,
    patterns: ["competitor_*", "rival_company"],
    responseMessage: "Avoid discussing competitor details",
    action: "WARN",
    priority: 3,
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "pii":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
    case "security":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "topic":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "content":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "BLOCK":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "WARN":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "REDACT":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const WorkspaceGuardRailsSection = () => {
  const [activeTab, setActiveTab] = useState<"system" | "organization">("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [rules, setRules] = useState({
    system: systemRules,
    organization: organizationRules,
  });

  const currentRules = activeTab === "system" ? rules.system : rules.organization;

  const filteredRules = currentRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (ruleId: string) => {
    setRules((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      ),
    }));
  };

  return (
    <section className="space-y-6">
      {/* Header Card */}
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Guardrails</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Combine organization-level guardrails to enforce security, compliance, and safety across user and system interactions.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "system" | "organization")}>
              <TabsList className="bg-muted/50">
                <TabsTrigger value="system" className="data-[state=active]:bg-background">
                  System
                </TabsTrigger>
                <TabsTrigger value="organization" className="data-[state=active]:bg-background">
                  Organization
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search and Add */}
          <div className="flex items-center gap-3 mt-5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter rules by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-lg border-border/50"
              />
            </div>
            <Button size="sm" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </div>

        {/* Rules Table */}
        <div className="border-t border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[70px]">Status</TableHead>
                <TableHead className="min-w-[180px]">Rule Name</TableHead>
                <TableHead className="min-w-[200px]">Patterns / Logic</TableHead>
                <TableHead className="min-w-[200px]">Response Message</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
                <TableHead className="w-[80px] text-right">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No rules found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id} className="group">
                    <TableCell>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggle(rule.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <p className="font-medium text-sm text-foreground">{rule.name}</p>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                            {rule.scope}
                          </Badge>
                          <span className="text-muted-foreground text-xs">•</span>
                          <Badge className={`text-[10px] px-1.5 py-0 h-5 font-normal border-0 ${getCategoryColor(rule.category)}`}>
                            {rule.category}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.patterns.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {rule.patterns.slice(0, 2).map((pattern, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="font-mono text-[10px] px-2 py-0.5 bg-muted/80"
                            >
                              {pattern}
                            </Badge>
                          ))}
                          {rule.patterns.length > 2 && (
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted/80">
                              +{rule.patterns.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          No regex (Semantic check)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {rule.responseMessage}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] px-2 py-0.5 font-semibold border-0 ${getActionColor(rule.action)}`}>
                          {rule.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">P:{rule.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};
