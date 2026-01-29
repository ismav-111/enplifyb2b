import { useState } from "react";
import { Check, Pencil, X, Users, Shield, Bell, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface WorkspaceSettingsProps {
  type: "organization" | "my" | "shared";
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow = ({ label, description, children }: SettingRowProps) => (
  <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
    <div className="flex-1 min-w-0 pr-4">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      )}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
}

const EditableField = ({ value, onSave }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 w-48 text-sm"
          autoFocus
        />
        <button
          onClick={handleCancel}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleSave}
          className="p-1.5 text-primary hover:text-primary/80 transition-colors"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-sm text-foreground">{value}</span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const workspaceConfig = {
  organization: {
    title: "Organization Workspace",
    subtitle: "Manage settings for your organization workspace",
    showAdvanced: true,
  },
  my: {
    title: "My Workspace",
    subtitle: "Manage your personal workspace settings",
    showAdvanced: false,
  },
  shared: {
    title: "Shared Workspace",
    subtitle: "Manage shared workspace settings and permissions",
    showAdvanced: true,
  },
};

export const WorkspaceSettingsSection = ({ type }: WorkspaceSettingsProps) => {
  const config = workspaceConfig[type];
  const [workspaceName, setWorkspaceName] = useState(
    type === "organization" ? "Acme Corp Reports" : 
    type === "my" ? "Analytics Projects" : "Marketing Team"
  );
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [publicAccess, setPublicAccess] = useState(false);

  return (
    <div className="space-y-12">
      {/* General Settings */}
      <section>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          General
        </h2>
        <div className="border border-border rounded-lg bg-card">
          <div className="px-5">
            <SettingRow label="Workspace Name">
              <EditableField value={workspaceName} onSave={setWorkspaceName} />
            </SettingRow>
            <SettingRow 
              label="Workspace ID" 
              description="Unique identifier for API access"
            >
              <span className="text-sm text-muted-foreground font-mono">
                ws_{type}_abc123
              </span>
            </SettingRow>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Notifications
        </h2>
        <div className="border border-border rounded-lg bg-card">
          <div className="px-5">
            <SettingRow 
              label="Email Notifications"
              description="Receive updates about workspace activity"
            >
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </SettingRow>
            <SettingRow 
              label="Auto-sync Data"
              description="Automatically sync data sources"
            >
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </SettingRow>
          </div>
        </div>
      </section>

      {/* Access & Permissions - Only for org and shared */}
      {config.showAdvanced && (
        <section>
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Access & Permissions
          </h2>
          <div className="border border-border rounded-lg bg-card">
            <div className="px-5">
              <SettingRow 
                label="Public Access"
                description="Allow anyone in your organization to view this workspace"
              >
                <Switch checked={publicAccess} onCheckedChange={setPublicAccess} />
              </SettingRow>
              <SettingRow 
                label="Default Role"
                description="Role assigned to new members"
              >
                <span className="text-sm text-foreground">Viewer</span>
              </SettingRow>
            </div>
          </div>
        </section>
      )}

      {/* Data & Storage */}
      <section>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Data & Storage
        </h2>
        <div className="border border-border rounded-lg bg-card">
          <div className="px-5">
            <SettingRow 
              label="Storage Used"
              description="Current workspace storage consumption"
            >
              <span className="text-sm text-foreground">2.4 GB / 10 GB</span>
            </SettingRow>
            <SettingRow 
              label="Data Retention"
              description="How long to keep historical data"
            >
              <span className="text-sm text-foreground">90 days</span>
            </SettingRow>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="text-xs font-medium text-destructive uppercase tracking-wider mb-4">
          Danger Zone
        </h2>
        <div className="border border-destructive/30 rounded-lg bg-destructive/5">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Delete Workspace</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete this workspace and all its data
                </p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
