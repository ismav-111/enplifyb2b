import { useState, useRef } from "react";
import {
  ChevronDown, 
  ChevronRight, 
  Settings, 
  FolderOpen,
  Users,
  Building2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Workspace, ChatSession } from "@/types/workspace";
import enplifyLogo from "@/assets/enplify-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";

interface AppSidebarProps {
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  onNewWorkspace: (type: "personal" | "shared" | "organization") => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspace: Workspace) => void;
  onOpenWorkspaceSettings: (workspace: Workspace) => void;
  onRenameSession: (workspaceId: string, sessionId: string, newName: string) => void;
  onDeleteSession: (workspaceId: string, sessionId: string) => void;
}

const sectionIcons = {
  personal: FolderOpen,
  shared: Users,
  organization: Building2,
};

// Session item with inline rename
const SessionItem = ({
  session,
  workspaceId,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  session: ChatSession;
  workspaceId: string;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditName(session.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== session.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(session.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <>
      <div
        className={cn(
          "chat-item w-full justify-between group",
          isActive && "chat-item-active"
        )}
      >
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              className="h-6 text-sm py-0 px-1"
            />
            <button
              onClick={handleSaveEdit}
              className="p-1 hover:bg-accent rounded"
            >
              <Check className="w-3 h-3 text-primary" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 hover:bg-accent rounded"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onSelect}
              className="flex-1 text-left min-w-0"
            >
              <span className="truncate text-sm block">{session.name}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all shrink-0"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="gap-2 text-sm" onClick={handleStartEdit}>
                  <Pencil className="w-3.5 h-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2 text-sm text-destructive focus:text-destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{session.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const WorkspaceSection = ({ 
  title, 
  workspaces, 
  activeSessionId, 
  onSelectSession,
  onNewSession,
  onNewWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onOpenWorkspaceSettings,
  onRenameSession,
  onDeleteSession,
  defaultExpanded = true,
  sectionType
}: { 
  title: string;
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  onNewWorkspace?: () => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspace: Workspace) => void;
  onOpenWorkspaceSettings: (workspace: Workspace) => void;
  onRenameSession: (workspaceId: string, sessionId: string, newName: string) => void;
  onDeleteSession: (workspaceId: string, sessionId: string) => void;
  defaultExpanded?: boolean;
  sectionType: 'personal' | 'shared' | 'organization';
}) => {
  const [isSectionExpanded, setIsSectionExpanded] = useState(defaultExpanded);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (workspaces.length === 0 && !onNewWorkspace) return null;

  return (
    <div className="mb-1">
      <button 
        onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/50 rounded-lg transition-colors group/header"
      >
        <div className="flex items-center gap-2">
          {(() => {
            const Icon = sectionIcons[sectionType];
            return <Icon className="w-4 h-4 text-muted-foreground" />;
          })()}
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onNewWorkspace && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onNewWorkspace();
              }}
              className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-accent rounded transition-all"
              title="New workspace"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground" />
            </span>
          )}
          {isSectionExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isSectionExpanded && (
        <div className="space-y-0.5 mt-1">
          {workspaces.map((workspace) => (
            <div key={workspace.id}>
              <div className="nav-item w-full justify-between group">
                <button
                  onClick={() => toggleWorkspace(workspace.id)}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <span className="truncate text-sm">{workspace.name}</span>
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewSession(workspace.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
                    title="New chat"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="gap-2 text-sm" onClick={() => onEditWorkspace(workspace)}>
                        <Pencil className="w-3.5 h-3.5" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-sm" onClick={() => onOpenWorkspaceSettings(workspace)}>
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="gap-2 text-sm text-destructive focus:text-destructive"
                        onClick={() => onDeleteWorkspace(workspace)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <button onClick={() => toggleWorkspace(workspace.id)}>
                    {expandedWorkspaces.has(workspace.id) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              
              {expandedWorkspaces.has(workspace.id) && workspace.sessions.length > 0 && (
                <div className="ml-4 pl-3 border-l border-border space-y-0.5 mt-1">
                  {workspace.sessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      workspaceId={workspace.id}
                      isActive={activeSessionId === session.id}
                      onSelect={() => onSelectSession(workspace.id, session.id)}
                      onRename={(newName) => onRenameSession(workspace.id, session.id, newName)}
                      onDelete={() => onDeleteSession(workspace.id, session.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export const AppSidebar = ({
  workspaces,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onNewWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onOpenWorkspaceSettings,
  onRenameSession,
  onDeleteSession,
}: AppSidebarProps) => {
  const personalWorkspaces = workspaces.filter(w => w.type === 'personal');
  const sharedWorkspaces = workspaces.filter(w => w.type === 'shared');
  const orgWorkspaces = workspaces.filter(w => w.type === 'organization');

  return (
    <aside className="flex flex-col h-screen w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center px-4 h-14 border-b border-border">
        <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
      </div>

      {/* Workspaces */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <WorkspaceSection
          title="My Workspaces"
          workspaces={personalWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onNewWorkspace={() => onNewWorkspace("personal")}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onOpenWorkspaceSettings={onOpenWorkspaceSettings}
          onRenameSession={onRenameSession}
          onDeleteSession={onDeleteSession}
          defaultExpanded={true}
          sectionType="personal"
        />
        
        {/* Separator */}
        <div className="py-2">
          <div className="h-px bg-border/60" />
        </div>
        
        <WorkspaceSection
          title="Shared Workspaces"
          workspaces={sharedWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onNewWorkspace={() => onNewWorkspace("shared")}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onOpenWorkspaceSettings={onOpenWorkspaceSettings}
          onRenameSession={onRenameSession}
          onDeleteSession={onDeleteSession}
          defaultExpanded={true}
          sectionType="shared"
        />
        
        {/* Separator */}
        <div className="py-2">
          <div className="h-px bg-border/60" />
        </div>
        
        <WorkspaceSection
          title="Org Workspaces"
          workspaces={orgWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onNewWorkspace={() => onNewWorkspace("organization")}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onOpenWorkspaceSettings={onOpenWorkspaceSettings}
          onRenameSession={onRenameSession}
          onDeleteSession={onDeleteSession}
          defaultExpanded={true}
          sectionType="organization"
        />
      </nav>
    </aside>
  );
};
