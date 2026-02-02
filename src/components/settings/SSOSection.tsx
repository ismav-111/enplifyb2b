import { useState } from "react";
import { Check, Pencil, XCircle, Trash2 } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SSOProvider {
  id: string;
  name: string;
  type: string;
  domain: string;
  status: "active" | "pending";
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export const SSOSection = () => {
  const [providers, setProviders] = useState<SSOProvider[]>([
    {
      id: "1",
      name: "Microsoft Azure AD",
      type: "SAML 2.0",
      domain: "acmecorp.com",
      status: "active",
      clientId: "c406756b-0009-4aff-b697-0f10ca57fcd9",
      clientSecret: "",
      tenantId: "0eadb77e-42dc-47f8-bbe3-ec2395e0712c",
    },
  ]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<SSOProvider | null>(null);
  const [newProvider, setNewProvider] = useState({
    name: "",
    domain: "",
    clientId: "",
    clientSecret: "",
    tenantId: "",
  });

  const handleAddProvider = () => {
    const provider: SSOProvider = {
      id: Date.now().toString(),
      name: newProvider.name || "Azure AD",
      type: "SAML 2.0",
      domain: newProvider.domain,
      status: "pending",
      clientId: newProvider.clientId,
      clientSecret: newProvider.clientSecret,
      tenantId: newProvider.tenantId,
    };
    setProviders([...providers, provider]);
    setNewProvider({ name: "", domain: "", clientId: "", clientSecret: "", tenantId: "" });
    setIsAddDialogOpen(false);
  };

  const handleEditProvider = (provider: SSOProvider) => {
    setEditingProvider({ ...provider });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingProvider) {
      setProviders(providers.map(p => 
        p.id === editingProvider.id ? editingProvider : p
      ));
      setIsEditDialogOpen(false);
      setEditingProvider(null);
    }
  };

  const handleClearProvider = (id: string) => {
    setProviders(providers.map(p => 
      p.id === id ? { ...p, clientId: "", clientSecret: "", tenantId: "", status: "pending" as const } : p
    ));
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              + Add Provider
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add SSO Provider</DialogTitle>
              <DialogDescription>
                Configure Azure AD identity provider.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="provider-name" className="text-xs">
                  Provider Name
                </Label>
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
                <Label htmlFor="domain" className="text-xs">
                  Domain
                </Label>
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
                <Label htmlFor="client-id" className="text-xs">
                  Azure Client ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-id"
                  placeholder="c406756b-0009-4aff-b697-0f10ca57fcd9"
                  value={newProvider.clientId}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, clientId: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-secret" className="text-xs">
                  Azure Client Secret <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="client-secret"
                  type="password"
                  placeholder="Enter Azure Client Secret"
                  value={newProvider.clientSecret}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, clientSecret: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-id" className="text-xs">
                  Azure Tenant ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="tenant-id"
                  placeholder="0eadb77e-42dc-47f8-bbe3-ec2395e0712c"
                  value={newProvider.tenantId}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, tenantId: e.target.value })
                  }
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProvider} size="sm">
                Add Provider
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit SSO Provider</DialogTitle>
            <DialogDescription>
              Update Azure AD configuration.
            </DialogDescription>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client-id" className="text-xs">
                  Azure Client ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-client-id"
                  placeholder="c406756b-0009-4aff-b697-0f10ca57fcd9"
                  value={editingProvider.clientId}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, clientId: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client-secret" className="text-xs">
                  Azure Client Secret <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-client-secret"
                  type="password"
                  placeholder="Enter Azure Client Secret"
                  value={editingProvider.clientSecret}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, clientSecret: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tenant-id" className="text-xs">
                  Azure Tenant ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-tenant-id"
                  placeholder="0eadb77e-42dc-47f8-bbe3-ec2395e0712c"
                  value={editingProvider.tenantId}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, tenantId: e.target.value })
                  }
                  className="h-9"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} size="sm">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {providers.length > 0 ? (
        <div className="border border-border rounded-lg bg-card divide-y divide-border">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="group grid grid-cols-[1fr_auto] items-center px-5 py-4 gap-4"
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

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => handleEditProvider(provider)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">Edit</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => handleClearProvider(provider.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">Clear</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <AlertDialog>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
