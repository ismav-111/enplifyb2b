import { useState } from "react";
import { Check, X, ImageIcon, Pencil } from "lucide-react";
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
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
    <span className={`text-sm text-foreground ${multiline ? "max-w-[300px]" : ""}`}>
      {value || <span className="text-muted-foreground italic">Not set</span>}
    </span>
  );
};

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
  editable?: boolean;
  onEdit?: () => void;
}

const SettingRow = ({ label, children, editable, onEdit }: SettingRowProps) => (
  <div className="group grid grid-cols-[140px_1fr_40px] items-center py-3.5 border-b border-border/40 last:border-b-0 gap-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="min-w-0">{children}</div>
    <div className="flex justify-end h-7">
      {editable && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
        >
          <Pencil className="w-4 h-4" />
        </Button>
      )}
    </div>
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
  const [editingField, setEditingField] = useState<string | null>(null);

  return (
    <section>
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        General
      </h2>
      <div className="border border-border/50 rounded-xl bg-card shadow-sm">
        <div className="px-5">
          <SettingRow 
            label="Workspace Icon" 
            editable 
            onEdit={() => {}}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {iconUrl ? (
                  <img src={iconUrl} alt="Workspace icon" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </SettingRow>
          <SettingRow 
            label="Name" 
            editable={editingField !== "name"} 
            onEdit={() => setEditingField("name")}
          >
            {editingField === "name" ? (
              <EditableFieldInline 
                value={workspaceName} 
                onSave={(v) => { onNameChange(v); setEditingField(null); }}
                onCancel={() => setEditingField(null)}
              />
            ) : (
              <span className="text-sm text-foreground">{workspaceName}</span>
            )}
          </SettingRow>
          <SettingRow 
            label="Description" 
            editable={editingField !== "description"} 
            onEdit={() => setEditingField("description")}
          >
            {editingField === "description" ? (
              <EditableFieldInline 
                value={description} 
                onSave={(v) => { onDescriptionChange(v); setEditingField(null); }}
                onCancel={() => setEditingField(null)}
                multiline
              />
            ) : (
              <span className="text-sm text-foreground max-w-[300px]">
                {description || <span className="text-muted-foreground italic">Not set</span>}
              </span>
            )}
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

interface EditableFieldInlineProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  multiline?: boolean;
}

const EditableFieldInline = ({ value, onSave, onCancel, multiline }: EditableFieldInlineProps) => {
  const [editValue, setEditValue] = useState(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter" && !multiline) onSave(editValue);
  };

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
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={onCancel}
      >
        <X className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-primary hover:text-primary"
        onClick={() => onSave(editValue)}
      >
        <Check className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
