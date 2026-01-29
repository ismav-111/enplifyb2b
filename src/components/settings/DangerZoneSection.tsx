import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DangerZoneSection = () => {
  const [confirmText, setConfirmText] = useState("");
  const orgName = "Acme Corporation";
  const isConfirmValid = confirmText === orgName;

  const handleDeleteAccount = () => {
    console.log("Deleting account...");
  };

  return (
    <section>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Danger Zone
      </h2>
      
      <div className="border border-destructive/20 rounded-lg bg-card p-5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Delete Organization
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Permanently delete your organization and all associated data. This action cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive shrink-0">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Organization</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      This will permanently delete <strong>{orgName}</strong> and remove all workspaces, documents, and API keys.
                    </p>
                    <p>
                      Type <strong>{orgName}</strong> to confirm.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <Input
                  placeholder={orgName}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="font-mono h-9"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={!isConfirmValid}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  Delete Organization
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  );
};
