import { useState, KeyboardEvent } from "react";
import { Trash2, UserPlus, X, Crown, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface PendingEmail {
  id: string;
  email: string;
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
  
  // Separate state for owners and members
  const [ownerInput, setOwnerInput] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [pendingOwners, setPendingOwners] = useState<PendingEmail[]>([]);
  const [pendingMembers, setPendingMembers] = useState<PendingEmail[]>([]);

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addEmail = (
    email: string,
    list: PendingEmail[],
    setList: React.Dispatch<React.SetStateAction<PendingEmail[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) return;
    
    // Check if already exists
    const alreadyExists = 
      pendingOwners.some(p => p.email === trimmedEmail) ||
      pendingMembers.some(p => p.email === trimmedEmail) ||
      users.some(u => u.email === trimmedEmail);
    
    if (alreadyExists) return;

    setList([...list, { id: `pending-${Date.now()}`, email: trimmedEmail }]);
    setInput("");
  };

  const handleOwnerKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(ownerInput, pendingOwners, setPendingOwners, setOwnerInput);
    } else if (e.key === "Backspace" && !ownerInput && pendingOwners.length > 0) {
      setPendingOwners(pendingOwners.slice(0, -1));
    }
  };

  const handleMemberKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(memberInput, pendingMembers, setPendingMembers, setMemberInput);
    } else if (e.key === "Backspace" && !memberInput && pendingMembers.length > 0) {
      setPendingMembers(pendingMembers.slice(0, -1));
    }
  };

  const removeOwner = (id: string) => {
    setPendingOwners(pendingOwners.filter((p) => p.id !== id));
  };

  const removeMember = (id: string) => {
    setPendingMembers(pendingMembers.filter((p) => p.id !== id));
  };

  const handleSendInvites = () => {
    if (pendingOwners.length === 0 && pendingMembers.length === 0) return;

    const newUsers: WorkspaceUser[] = [
      ...pendingOwners.map((p) => ({
        id: `user-${Date.now()}-${Math.random()}`,
        name: p.email.split("@")[0],
        email: p.email,
        role: "owner" as const,
      })),
      ...pendingMembers.map((p) => ({
        id: `user-${Date.now()}-${Math.random()}`,
        name: p.email.split("@")[0],
        email: p.email,
        role: "member" as const,
      })),
    ];

    setUsers([...users, ...newUsers]);
    setPendingOwners([]);
    setPendingMembers([]);
    setOwnerInput("");
    setMemberInput("");
    setShowInvite(false);
  };

  const handleCancelInvite = () => {
    setPendingOwners([]);
    setPendingMembers([]);
    setOwnerInput("");
    setMemberInput("");
    setShowInvite(false);
  };

  const handleRoleChange = (userId: string, newRole: "owner" | "member") => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const totalPending = pendingOwners.length + pendingMembers.length;

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
            <div className="p-5 space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Invite People
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Owners Field */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <label className="text-xs font-medium text-foreground">Owners</label>
                  </div>
                  <div className="border border-border rounded-lg bg-background p-2 min-h-[100px] flex flex-wrap gap-1.5 content-start">
                    {pendingOwners.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md px-2 py-1 text-xs"
                      >
                        {p.email}
                        <button
                          onClick={() => removeOwner(p.id)}
                          className="p-0.5 rounded hover:bg-amber-500/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      type="email"
                      placeholder={pendingOwners.length === 0 ? "Add owner emails..." : ""}
                      value={ownerInput}
                      onChange={(e) => setOwnerInput(e.target.value)}
                      onKeyDown={handleOwnerKeyDown}
                      onBlur={() => ownerInput && addEmail(ownerInput, pendingOwners, setPendingOwners, setOwnerInput)}
                      className="flex-1 min-w-[120px] border-0 p-0 h-6 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Full access to settings & members
                  </p>
                </div>

                {/* Members Field */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <label className="text-xs font-medium text-foreground">Members</label>
                  </div>
                  <div className="border border-border rounded-lg bg-background p-2 min-h-[100px] flex flex-wrap gap-1.5 content-start">
                    {pendingMembers.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-md px-2 py-1 text-xs"
                      >
                        {p.email}
                        <button
                          onClick={() => removeMember(p.id)}
                          className="p-0.5 rounded hover:bg-blue-500/20 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      type="email"
                      placeholder={pendingMembers.length === 0 ? "Add member emails..." : ""}
                      value={memberInput}
                      onChange={(e) => setMemberInput(e.target.value)}
                      onKeyDown={handleMemberKeyDown}
                      onBlur={() => memberInput && addEmail(memberInput, pendingMembers, setPendingMembers, setMemberInput)}
                      className="flex-1 min-w-[120px] border-0 p-0 h-6 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Can view & interact with content
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to add emails
              </p>
            </div>

            {/* Action Footer */}
            <div className="px-5 py-3 bg-muted/30 flex items-center justify-between border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                {totalPending === 0 
                  ? "No invites pending" 
                  : `${totalPending} ${totalPending === 1 ? 'invite' : 'invites'} pending`}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelInvite}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSendInvites}
                  disabled={totalPending === 0}
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
