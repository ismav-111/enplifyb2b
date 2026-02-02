import { useState } from "react";
import { Trash2, UserPlus, Info } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "member";
  isCurrentUser?: boolean;
}

const mockUsers: WorkspaceUser[] = [
  { id: "1", name: "John Smith", email: "john@acme.com", role: "owner", isCurrentUser: true },
  { id: "2", name: "Sarah Connor", email: "sarah@acme.com", role: "member" },
  { id: "3", name: "Mike Wilson", email: "mike@acme.com", role: "member" },
];

// Mock available users for selection
const availableUsers = [
  { id: "u1", name: "Alice Johnson", email: "alice@acme.com" },
  { id: "u2", name: "Bob Williams", email: "bob@acme.com" },
  { id: "u3", name: "Carol Davis", email: "carol@acme.com" },
  { id: "u4", name: "David Brown", email: "david@acme.com" },
  { id: "u5", name: "Eva Martinez", email: "eva@acme.com" },
];

const roleLabels: Record<string, string> = {
  owner: "Owner",
  member: "Member",
};

export const WorkspaceUsersSection = () => {
  const [users, setUsers] = useState<WorkspaceUser[]>(mockUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleAddUsers = () => {
    const newUsers: WorkspaceUser[] = [];

    selectedOwners.forEach((userId) => {
      const user = availableUsers.find((u) => u.id === userId);
      if (user && !users.some((u) => u.email === user.email)) {
        newUsers.push({
          id: `user-${Date.now()}-${Math.random()}`,
          name: user.name,
          email: user.email,
          role: "owner",
        });
      }
    });

    selectedMembers.forEach((userId) => {
      const user = availableUsers.find((u) => u.id === userId);
      if (user && !users.some((u) => u.email === user.email) && !newUsers.some((u) => u.email === user.email)) {
        newUsers.push({
          id: `user-${Date.now()}-${Math.random()}`,
          name: user.name,
          email: user.email,
          role: "member",
        });
      }
    });

    setUsers([...users, ...newUsers]);
    setSelectedOwners([]);
    setSelectedMembers([]);
    setDialogOpen(false);
  };

  const handleCancel = () => {
    setSelectedOwners([]);
    setSelectedMembers([]);
    setDialogOpen(false);
  };

  const handleRoleChange = (userId: string, newRole: "owner" | "member") => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  // Filter out already added users
  const getAvailableForSelection = () => {
    const existingEmails = users.map((u) => u.email);
    return availableUsers.filter((u) => !existingEmails.includes(u.email));
  };

  const filteredAvailable = getAvailableForSelection();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Members
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDialogOpen(true)}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
        >
          <UserPlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Members Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Add Members</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Owners Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-foreground">Owners</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Full access to manage workspace settings and members</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={selectedOwners[0] || ""}
                onValueChange={(value) => {
                  if (value && !selectedOwners.includes(value)) {
                    setSelectedOwners([...selectedOwners, value]);
                  }
                }}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Search and select owners" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailable
                    .filter((u) => !selectedOwners.includes(u.id) && !selectedMembers.includes(u.id))
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-muted-foreground text-xs">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  {filteredAvailable.filter((u) => !selectedOwners.includes(u.id) && !selectedMembers.includes(u.id)).length === 0 && (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No users available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {selectedOwners.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedOwners.map((id) => {
                    const user = availableUsers.find((u) => u.id === id);
                    return user ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs"
                      >
                        {user.name}
                        <button
                          onClick={() => setSelectedOwners(selectedOwners.filter((o) => o !== id))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Members Field */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-foreground">Members</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Can view and interact with workspace content</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={selectedMembers[0] || ""}
                onValueChange={(value) => {
                  if (value && !selectedMembers.includes(value)) {
                    setSelectedMembers([...selectedMembers, value]);
                  }
                }}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Search and select members" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAvailable
                    .filter((u) => !selectedOwners.includes(u.id) && !selectedMembers.includes(u.id))
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-muted-foreground text-xs">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  {filteredAvailable.filter((u) => !selectedOwners.includes(u.id) && !selectedMembers.includes(u.id)).length === 0 && (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No users available
                    </div>
                  )}
                </SelectContent>
              </Select>
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedMembers.map((id) => {
                    const user = availableUsers.find((u) => u.id === id);
                    return user ? (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs"
                      >
                        {user.name}
                        <button
                          onClick={() => setSelectedMembers(selectedMembers.filter((m) => m !== id))}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUsers}
              disabled={selectedOwners.length === 0 && selectedMembers.length === 0}
            >
              Add Users
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Members List */}
      <div className="border border-border/50 rounded-xl bg-card shadow-sm">
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
