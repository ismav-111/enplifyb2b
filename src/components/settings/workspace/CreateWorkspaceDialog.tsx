import { useState } from "react";
import { Plus, FolderOpen, Users, Building2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceType: "personal" | "shared" | "organization";
  onCreateWorkspace: (workspace: { name: string; description: string; type: "personal" | "shared" | "organization" }) => void;
}

const workspaceTypeConfig = {
  personal: {
    icon: FolderOpen,
    title: "Create Personal Workspace",
    description: "Create a new workspace for your personal projects and analysis.",
  },
  shared: {
    icon: Users,
    title: "Create Shared Workspace",
    description: "Create a workspace to collaborate with your team members.",
  },
  organization: {
    icon: Building2,
    title: "Create Organization Workspace",
    description: "Create an organization-wide workspace for company-level projects.",
  },
};

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  workspaceType,
  onCreateWorkspace,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = workspaceTypeConfig[workspaceType];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onCreateWorkspace({
      name: name.trim(),
      description: description.trim(),
      type: workspaceType,
    });

    setName("");
    setDescription("");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-accent">
              <Icon className="w-5 h-5 text-foreground" />
            </div>
            <DialogTitle className="text-lg">{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="Enter workspace name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="description"
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
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
