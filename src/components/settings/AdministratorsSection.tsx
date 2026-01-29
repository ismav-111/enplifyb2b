import { useState } from "react";
import { MoreHorizontal, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";

interface Administrator {
  id: string;
  name: string;
  email: string;
  isCurrentUser: boolean;
}

// Mock current user ID - in real app this would come from auth context
const CURRENT_USER_ID = "1";

export const AdministratorsSection = () => {
  const [admins, setAdmins] = useState<Administrator[]>([
    { id: "1", name: "John Doe", email: "john@acmecorp.com", isCurrentUser: true },
    { id: "2", name: "Sarah Chen", email: "sarah@acmecorp.com", isCurrentUser: false },
    { id: "3", name: "Michael Park", email: "michael@acmecorp.com", isCurrentUser: false },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = () => {
    const newAdmin: Administrator = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      isCurrentUser: false,
    };
    setAdmins([...admins, newAdmin]);
    setInviteEmail("");
    setIsDialogOpen(false);
  };

  const handleRemove = (id: string) => {
    setAdmins(admins.filter((a) => a.id !== id));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Administrators
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              + Invite Member
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Administrator</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new administrator.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="invite-email" className="text-xs">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-9 mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail} size="sm">
                Send Invitation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg bg-card divide-y divide-border">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="px-5 py-3 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {getInitials(admin.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{admin.name}</p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-2 py-1 bg-muted rounded">
                {admin.isCurrentUser ? "You" : "Admin"}
              </span>
              {!admin.isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      className="text-xs text-destructive focus:text-destructive"
                      onClick={() => handleRemove(admin.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
