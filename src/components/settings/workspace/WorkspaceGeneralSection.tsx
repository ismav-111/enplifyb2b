import { useState } from "react";
import { Check, Pencil, X, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WorkspaceGeneralSectionProps {
  workspaceName: string;
  onNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  createdAt: string;
  createdBy: string;
}

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
}

const EditableField = ({ value, onSave, multiline }: EditableFieldProps) => {
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
      <div className="flex items-start gap-2">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="min-h-[60px] w-64 text-sm resize-none"
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 w-48 text-sm"
            autoFocus
          />
        )}
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
    <div className="flex items-start gap-2 group">
      <span className={`text-sm text-foreground ${multiline ? "max-w-[300px]" : ""}`}>
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </span>
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

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

export const WorkspaceGeneralSection = ({
  workspaceName,
  onNameChange,
  description,
  onDescriptionChange,
  createdAt,
  createdBy,
}: WorkspaceGeneralSectionProps) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  return (
    <section>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        General
      </h2>
      <div className="border border-border rounded-lg bg-card">
        <div className="px-5">
          <SettingRow label="Workspace Icon">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {iconUrl ? (
                  <img src={iconUrl} alt="Workspace icon" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                Change
              </button>
            </div>
          </SettingRow>
          <SettingRow label="Workspace Name">
            <EditableField value={workspaceName} onSave={onNameChange} />
          </SettingRow>
          <SettingRow label="Description" description="Brief description of this workspace">
            <EditableField value={description} onSave={onDescriptionChange} multiline />
          </SettingRow>
          <SettingRow label="Created" description="When this workspace was created">
            <span className="text-sm text-muted-foreground">{createdAt}</span>
          </SettingRow>
          <SettingRow label="Created By">
            <span className="text-sm text-muted-foreground">{createdBy}</span>
          </SettingRow>
        </div>
      </div>
    </section>
  );
};
