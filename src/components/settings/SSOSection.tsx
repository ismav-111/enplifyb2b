import { useState } from "react";
import { Check, ExternalLink, Plus, Shield, Trash2 } from "lucide-react";
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">SSO Configuration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure single sign-on for your organization
        </p>
      </div>

      {/* Providers List */}
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {provider.name}
                  </h3>
                  {provider.status === "active" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {provider.type} • {provider.domain}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleRemoveProvider(provider.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {providers.length === 0 && (
          <div className="bg-card border border-border border-dashed rounded-xl p-8 text-center">
            <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No SSO providers configured
            </p>
          </div>
        )}
      </div>

      {/* Add Provider Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add SSO Provider
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add SSO Provider</DialogTitle>
            <DialogDescription>
              Configure a new SAML 2.0 identity provider for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Provider Name</Label>
              <Input
                id="provider-name"
                placeholder="e.g., Microsoft Azure AD"
                value={newProvider.name}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., yourcompany.com"
                value={newProvider.domain}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, domain: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entity-id">Entity ID</Label>
              <Input
                id="entity-id"
                placeholder="https://sts.windows.net/..."
                value={newProvider.entityId}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, entityId: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sso-url">SSO URL</Label>
              <Input
                id="sso-url"
                placeholder="https://login.microsoftonline.com/..."
                value={newProvider.ssoUrl}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, ssoUrl: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProvider}>Add Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
