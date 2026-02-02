import { FolderOpen, Users, Building2, Plus, MoreHorizontal, Pencil, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Workspace } from "@/types/workspace";
import { cn } from "@/lib/utils";

interface WorkspaceListSectionProps {
  type: "personal" | "shared" | "organization";
  workspaces: Workspace[];
  onCreateWorkspace: () => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspace: Workspace) => void;
  onOpenWorkspace: (workspace: Workspace) => void;
}

const typeConfig = {
  personal: {
    title: "My Workspaces",
    description: "Manage your personal workspaces for individual projects and analysis.",
    icon: FolderOpen,
    emptyMessage: "No personal workspaces yet. Create one to get started.",
    canCreate: true,
  },
  shared: {
    title: "Shared Workspaces",
    description: "Workspaces shared with you by team members for collaboration.",
    icon: Users,
    emptyMessage: "No shared workspaces available. Ask a team member to invite you.",
    canCreate: false,
  },
  organization: {
    title: "Org Workspaces",
    description: "Organization-wide workspaces for company-level projects and reports.",
    icon: Building2,
    emptyMessage: "No organization workspaces yet. Create one for your team.",
    canCreate: true,
  },
};

const WorkspaceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'personal': return <FolderOpen className="w-5 h-5" />;
    case 'shared': return <Users className="w-5 h-5" />;
    case 'organization': return <Building2 className="w-5 h-5" />;
    default: return <FolderOpen className="w-5 h-5" />;
  }
};

export function WorkspaceListSection({
  type,
  workspaces,
  onCreateWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onOpenWorkspace,
}: WorkspaceListSectionProps) {
  const config = typeConfig[type];

  return (
    <div className="space-y-6">
      {/* Create Button */}
      {config.canCreate && (
        <div className="flex justify-end">
          <Button onClick={onCreateWorkspace} size="sm">
            <Plus className="w-4 h-4 mr-1.5" />
            New Workspace
          </Button>
        </div>
      )}

      {/* Workspace List */}
      <div className="space-y-2">
        {workspaces.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-3">
              <config.icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{config.emptyMessage}</p>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className="group flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
              onClick={() => onOpenWorkspace(workspace)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-accent shrink-0">
                  <WorkspaceIcon type={workspace.type} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {workspace.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {workspace.sessions.length} {workspace.sessions.length === 1 ? "session" : "sessions"}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenWorkspace(workspace); }}>
                    <Settings2 className="w-4 h-4 mr-2" />
                    Open Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditWorkspace(workspace); }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDeleteWorkspace(workspace); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
