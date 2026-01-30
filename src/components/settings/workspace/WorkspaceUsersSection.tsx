import { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
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
  role: "admin" | "editor" | "viewer";
  isCurrentUser?: boolean;
}

const mockUsers: WorkspaceUser[] = [
  { id: "1", name: "John Smith", email: "john@acme.com", role: "admin", isCurrentUser: true },
  { id: "2", name: "Sarah Connor", email: "sarah@acme.com", role: "editor" },
  { id: "3", name: "Mike Wilson", email: "mike@acme.com", role: "viewer" },
];

const roleLabels: Record<string, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const WorkspaceUsersSection = () => {
  const [users, setUsers] = useState<WorkspaceUser[]>(mockUsers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("viewer");

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newUser: WorkspaceUser = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
    };
    setUsers([...users, newUser]);
    setInviteEmail("");
    setShowInvite(false);
  };

  const handleRoleChange = (userId: string, newRole: "admin" | "editor" | "viewer") => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Users
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInvite(!showInvite)}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      <div className="border border-border/50 rounded-xl bg-card shadow-sm">
        {showInvite && (
          <div className="px-5 py-4 border-b border-border/40 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} size="sm">
                Invite
              </Button>
            </div>
          </div>
        )}

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
                    onValueChange={(v) => handleRoleChange(user.id, v as any)}
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
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
