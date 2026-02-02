import { useState, KeyboardEvent } from "react";
import { Trash2, UserPlus, X, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "member";
  isCurrentUser?: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  role: "owner" | "member";
}

const mockUsers: WorkspaceUser[] = [
  { id: "1", name: "John Smith", email: "john@acme.com", role: "owner", isCurrentUser: true },
  { id: "2", name: "Sarah Connor", email: "sarah@acme.com", role: "member" },
  { id: "3", name: "Mike Wilson", email: "mike@acme.com", role: "member" },
];

const roleLabels: Record<string, string> = {
  owner: "Owner",
  member: "Member",
};

export const WorkspaceUsersSection = () => {
  const [users, setUsers] = useState<WorkspaceUser[]>(mockUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmailToInvites = (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) return;
    
    // Check if already in pending or existing users
    const alreadyExists = 
      pendingInvites.some(p => p.email === trimmedEmail) ||
      users.some(u => u.email === trimmedEmail);
    
    if (alreadyExists) return;

    setPendingInvites([
      ...pendingInvites,
      {
        id: `pending-${Date.now()}`,
        email: trimmedEmail,
        role: "member",
      },
    ]);
    setEmailInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmailToInvites(emailInput);
    } else if (e.key === "Backspace" && !emailInput && pendingInvites.length > 0) {
      // Remove last pending invite when backspace is pressed on empty input
      setPendingInvites(pendingInvites.slice(0, -1));
    }
  };

  const handleInputBlur = () => {
    if (emailInput) {
      addEmailToInvites(emailInput);
    }
  };

  const removePendingInvite = (id: string) => {
    setPendingInvites(pendingInvites.filter((p) => p.id !== id));
  };

  const updatePendingRole = (id: string, role: "owner" | "member") => {
    setPendingInvites(
      pendingInvites.map((p) => (p.id === id ? { ...p, role } : p))
    );
  };

  const handleSendInvites = () => {
    if (pendingInvites.length === 0) return;

    const newUsers: WorkspaceUser[] = pendingInvites.map((invite) => ({
      id: `user-${Date.now()}-${Math.random()}`,
      name: invite.email.split("@")[0],
      email: invite.email,
      role: invite.role,
    }));

    setUsers([...users, ...newUsers]);
    setPendingInvites([]);
    setShowInvite(false);
  };

  const handleCancelInvite = () => {
    setPendingInvites([]);
    setEmailInput("");
    setShowInvite(false);
  };

  const handleRoleChange = (userId: string, newRole: "owner" | "member") => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Members
        </h2>
        {!showInvite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInvite(true)}
            className="h-7 w-7 text-muted-foreground hover:text-primary"
          >
            <UserPlus className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm">
        {/* Invite Panel */}
        {showInvite && (
          <div className="border-b border-border/40">
            {/* Email Input Area */}
            <div className="px-5 py-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">
                Invite People
              </label>
              <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-background min-h-[44px] flex-wrap">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center gap-1.5 bg-muted/80 rounded-md pl-2.5 pr-1 py-1 group/chip"
                  >
                    <span className="text-sm text-foreground">{invite.email}</span>
                    <Select
                      value={invite.role}
                      onValueChange={(v) => updatePendingRole(invite.id, v as "owner" | "member")}
                    >
                      <SelectTrigger className="h-5 w-[70px] border-0 bg-transparent px-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide focus:ring-0 focus:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner" className="text-xs">Owner</SelectItem>
                        <SelectItem value="member" className="text-xs">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removePendingInvite(invite.id)}
                      className="p-0.5 rounded hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <Input
                  type="email"
                  placeholder={pendingInvites.length === 0 ? "Enter email addresses..." : "Add more..."}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleInputBlur}
                  className="flex-1 min-w-[150px] border-0 p-0 h-7 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">,</kbd> to add multiple emails
              </p>
            </div>

            {/* Action Buttons */}
            <div className="px-5 py-3 bg-muted/30 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {pendingInvites.length === 0 
                  ? "No invites pending" 
                  : `${pendingInvites.length} ${pendingInvites.length === 1 ? 'person' : 'people'} will be invited`}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelInvite}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSendInvites}
                  disabled={pendingInvites.length === 0}
                >
                  Send Invites
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Members List */}
        <div className="divide-y divide-border/40">
          {users.map((user) => (
            <div
              key={user.id}
              className="group grid grid-cols-[1fr_100px_40px] items-center px-5 py-3 gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-muted">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="ml-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-1.5 py-0.5 bg-muted rounded">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex justify-center">
                {user.isCurrentUser ? (
                  <span className="text-xs text-muted-foreground">
                    {roleLabels[user.role]}
                  </span>
                ) : (
                  <Select
                    value={user.role}
                    onValueChange={(v) => handleRoleChange(user.id, v as "owner" | "member")}
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="flex justify-end">
                {!user.isCurrentUser ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {user.name} from this workspace? They will lose access to all workspace resources.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveUser(user.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <span className="w-7" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
