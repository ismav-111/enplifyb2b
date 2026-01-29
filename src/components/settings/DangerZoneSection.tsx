import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
    // Handle account deletion
    console.log("Deleting account...");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Irreversible and destructive actions
        </p>
      </div>

      <div className="bg-card border border-destructive/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-foreground">
              Delete Organization
            </h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Permanently delete your organization and all associated data. This action
              cannot be undone. All workspaces, documents, chat history, and API keys
              will be permanently removed.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <span className="block">
                      This action cannot be undone. This will permanently delete your
                      organization <strong>{orgName}</strong> and remove all associated
                      data from our servers.
                    </span>
                    <span className="block">
                      Please type <strong>{orgName}</strong> to confirm.
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                  <Input
                    placeholder={orgName}
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="font-mono"
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
      </div>
    </div>
  );
};
