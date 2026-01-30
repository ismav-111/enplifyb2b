import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Workspace } from "@/types/workspace";

interface EditWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace | null;
  onSaveWorkspace: (workspaceId: string, updates: { name: string; description?: string }) => void;
}

export function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onSaveWorkspace,
}: EditWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription("");
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onSaveWorkspace(workspace.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    });

    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  if (!workspace) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-accent">
              <Pencil className="w-5 h-5 text-foreground" />
            </div>
            <DialogTitle className="text-lg">Edit Workspace</DialogTitle>
          </div>
          <DialogDescription>
            Update the workspace details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Workspace Name</Label>
            <Input
              id="edit-name"
              placeholder="Enter workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="edit-description"
              placeholder="Brief description of this workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
