import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GuardRail {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configurable?: boolean;
  configValue?: string;
}

const initialGuardRails: GuardRail[] = [
  {
    id: "content_filter",
    name: "Content Filtering",
    description: "Filter inappropriate or offensive content from responses",
    enabled: true,
  },
  {
    id: "pii_detection",
    name: "PII Detection",
    description: "Detect and mask personally identifiable information",
    enabled: true,
  },
  {
    id: "data_retention",
    name: "Data Retention Limits",
    description: "Automatically delete conversation data after specified period",
    enabled: false,
    configurable: true,
    configValue: "90",
  },
  {
    id: "output_length",
    name: "Output Length Limit",
    description: "Limit the maximum length of AI responses",
    enabled: false,
    configurable: true,
    configValue: "2000",
  },
  {
    id: "topic_restriction",
    name: "Topic Restrictions",
    description: "Restrict AI from discussing certain topics",
    enabled: false,
  },
  {
    id: "source_citation",
    name: "Source Citation Required",
    description: "Require AI to cite sources for all factual claims",
    enabled: true,
  },
];

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow = ({ label, description, children }: SettingRowProps) => (
  <div className="flex items-start justify-between py-4 border-b border-border/40 last:border-b-0">
    <div className="flex-1 min-w-0 pr-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

export const WorkspaceGuardRailsSection = () => {
  const [guardRails, setGuardRails] = useState<GuardRail[]>(initialGuardRails);
  const [customInstructions, setCustomInstructions] = useState("");

  const handleToggle = (id: string) => {
    setGuardRails(
      guardRails.map((gr) =>
        gr.id === id ? { ...gr, enabled: !gr.enabled } : gr
      )
    );
  };

  const handleConfigChange = (id: string, value: string) => {
    setGuardRails(
      guardRails.map((gr) =>
        gr.id === id ? { ...gr, configValue: value } : gr
      )
    );
  };

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Guardrails
      </h2>
      
      <div className="border border-border/50 rounded-xl bg-card shadow-sm">
        <div className="px-5">
          {guardRails.map((guardRail) => (
            <SettingRow
              key={guardRail.id}
              label={guardRail.name}
              description={guardRail.description}
            >
              <div className="flex items-center gap-3">
                {guardRail.configurable && guardRail.enabled && (
                  <Input
                    value={guardRail.configValue}
                    onChange={(e) => handleConfigChange(guardRail.id, e.target.value)}
                    className="h-8 w-20 text-sm text-right rounded-lg"
                  />
                )}
                <Switch
                  checked={guardRail.enabled}
                  onCheckedChange={() => handleToggle(guardRail.id)}
                />
              </div>
            </SettingRow>
          ))}
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="mt-6">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Custom Instructions
        </h3>
        <div className="border border-border/50 rounded-xl bg-card shadow-sm p-5">
          <Textarea
            placeholder="Add custom instructions for how the AI should behave in this workspace..."
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            className="min-h-[100px] resize-none rounded-lg border-border/50"
          />
          <p className="text-xs text-muted-foreground mt-3">
            These instructions will be applied to all AI interactions in this workspace.
          </p>
        </div>
      </div>
    </section>
  );
};
