import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/types/workspace";

interface DeleteWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace | null;
  onDeleteWorkspace: (workspaceId: string) => void;
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onDeleteWorkspace,
}: DeleteWorkspaceDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = workspace && confirmText === workspace.name;

  const handleDelete = async () => {
    if (!workspace || !isConfirmed) return;

    setIsDeleting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    onDeleteWorkspace(workspace.id);
    setConfirmText("");
    setIsDeleting(false);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
    }
    onOpenChange(newOpen);
  };

  if (!workspace) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-lg">Delete Workspace</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the workspace{" "}
            <span className="font-semibold text-foreground">"{workspace.name}"</span>{" "}
            and all of its sessions, data sources, and configurations.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 pt-2">
          <Label htmlFor="confirm-delete">
            Type <span className="font-semibold">{workspace.name}</span> to confirm
          </Label>
          <Input
            id="confirm-delete"
            placeholder="Enter workspace name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoFocus
          />
        </div>

        <AlertDialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Workspace"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
