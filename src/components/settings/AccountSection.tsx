import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FieldRowProps {
  label: string;
  value: string;
  editable?: boolean;
  onSave?: (value: string) => void;
}

const FieldRow = ({ label, value, editable = false, onSave }: FieldRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave?.(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className="grid grid-cols-[140px_1fr_80px] items-center py-3.5 border-b border-border last:border-b-0 gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      
      <div className="min-w-0">
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm max-w-xs"
            autoFocus
          />
        ) : (
          <span className="text-sm text-foreground">{value || "—"}</span>
        )}
      </div>

      <div className="flex items-center justify-end gap-1">
        {isEditing ? (
          <>
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
          </>
        ) : editable ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const AccountSection = () => {
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [phone, setPhone] = useState("+1 (555) 123-4567");

  return (
    <section>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Profile
      </h2>
      <div className="border border-border rounded-lg bg-card">
        <div className="px-5">
          <FieldRow
            label="Organization"
            value={orgName}
            editable
            onSave={setOrgName}
          />
          <FieldRow label="Email" value="john@acmecorp.com" />
          <FieldRow label="Username" value="john.doe" />
          <FieldRow
            label="Phone"
            value={phone}
            editable
            onSave={setPhone}
          />
        </div>
      </div>
    </section>
  );
};
