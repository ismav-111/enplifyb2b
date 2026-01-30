import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";

interface SSOProvider {
  id: string;
  name: string;
  type: string;
  domain: string;
  status: "active" | "pending";
}

export const SSOSection = () => {
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: "1",
      name: "Microsoft Azure AD",
      type: "SAML 2.0",
      domain: "acmecorp.com",
      status: "active",
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    domain: "",
    entityId: "",
    ssoUrl: "",
  });

  const handleAddProvider = () => {
    const provider: SSOProvider = {
      id: Date.now().toString(),
      name: newProvider.name,
      type: "SAML 2.0",
      domain: newProvider.domain,
      status: "pending",
    };
    setProviders([...providers, provider]);
    setNewProvider({ name: "", domain: "", entityId: "", ssoUrl: "" });
    setIsDialogOpen(false);
  };

  const handleRemoveProvider = (id: string) => {
    setProviders(providers.filter((p) => p.id !== id));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          SSO Configuration
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              + Add Provider
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add SSO Provider</DialogTitle>
              <DialogDescription>
                Configure a SAML 2.0 identity provider.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider-name" className="text-xs">Provider Name</Label>
                <Input
                  id="provider-name"
                  placeholder="e.g., Microsoft Azure AD"
                  value={newProvider.name}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, name: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-xs">Domain</Label>
                <Input
                  id="domain"
                  placeholder="e.g., yourcompany.com"
                  value={newProvider.domain}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, domain: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity-id" className="text-xs">Entity ID</Label>
                <Input
                  id="entity-id"
                  placeholder="https://sts.windows.net/..."
                  value={newProvider.entityId}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, entityId: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sso-url" className="text-xs">SSO URL</Label>
                <Input
                  id="sso-url"
                  placeholder="https://login.microsoftonline.com/..."
                  value={newProvider.ssoUrl}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, ssoUrl: e.target.value })
                  }
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProvider} size="sm">
                Add Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {providers.length > 0 ? (
        <div className="border border-border rounded-lg bg-card divide-y divide-border">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="grid grid-cols-[1fr_auto] items-center px-5 py-4 gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {provider.name}
                  </span>
                  {provider.status === "active" ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                      <Check className="w-2.5 h-2.5" />
                      Active
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {provider.type} · {provider.domain}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Configure
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove SSO Provider</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {provider.name}? Users will no longer be able to sign in using this provider.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleRemoveProvider(provider.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-lg py-8 text-center">
          <p className="text-sm text-muted-foreground">No SSO providers configured</p>
        </div>
      )}
    </section>
  );
};
