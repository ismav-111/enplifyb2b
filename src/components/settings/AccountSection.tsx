import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditableFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  onSave?: (value: string) => void;
}

const EditableField = ({ label, value, editable = false, onSave }: EditableFieldProps) => {
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
    <div className="py-4 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </label>
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mt-1.5 h-9"
              autoFocus
            />
          ) : (
            <p className="mt-1 text-sm text-foreground truncate">{value || "—"}</p>
          )}
        </div>
        {editable && (
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary"
                  onClick={handleSave}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const AccountSection = () => {
  const [orgName, setOrgName] = useState("Acme Corporation");
  const [phone, setPhone] = useState("+1 (555) 123-4567");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Account</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="px-6">
          <EditableField
            label="Organization Name"
            value={orgName}
            editable
            onSave={setOrgName}
          />
          <EditableField
            label="Email"
            value="john@acmecorp.com"
          />
          <EditableField
            label="Username"
            value="john.doe"
          />
          <EditableField
            label="Phone Number"
            value={phone}
            editable
            onSave={setPhone}
          />
        </div>
      </div>
    </div>
  );
};
