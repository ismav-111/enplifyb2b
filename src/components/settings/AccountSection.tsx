import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0 group">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
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
          </>
        ) : (
          <>
            <span className="text-sm text-foreground">{value || "—"}</span>
            {editable && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
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
