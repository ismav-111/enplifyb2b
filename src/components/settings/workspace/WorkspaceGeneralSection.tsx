import { useState } from "react";
import { Check, X, ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleCancel();
    if (e.key === "Enter" && !multiline) handleSave();
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] w-64 text-sm resize-none"
            autoFocus
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 w-48 text-sm"
            autoFocus
          />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleCancel}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary hover:text-primary"
          onClick={handleSave}
        >
          <Check className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <span className={`text-sm text-foreground ${multiline ? "max-w-[300px]" : ""}`}>
        {value || <span className="text-muted-foreground italic">Not set</span>}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </Button>
    </div>
  );
};

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow = ({ label, description, children }: SettingRowProps) => (
  <div className="grid grid-cols-[140px_1fr] items-start py-4 border-b border-border last:border-b-0 gap-4">
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
    <div>{children}</div>
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
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Change
              </Button>
            </div>
          </SettingRow>
          <SettingRow label="Name">
            <EditableField value={workspaceName} onSave={onNameChange} />
          </SettingRow>
          <SettingRow label="Description">
            <EditableField value={description} onSave={onDescriptionChange} multiline />
          </SettingRow>
          <SettingRow label="Created">
            <span className="text-sm text-foreground">{createdAt}</span>
          </SettingRow>
          <SettingRow label="Created By">
            <span className="text-sm text-foreground">{createdBy}</span>
          </SettingRow>
        </div>
      </div>
    </section>
  );
};
