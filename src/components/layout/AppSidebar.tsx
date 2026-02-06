import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Workspace } from "@/types/workspace";
import enplifyLogo from "@/assets/enplify-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppSidebarProps {
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
}

const sectionIcons = {
  personal: FolderOpen,
  shared: Users,
  organization: Building2,
};

const WorkspaceSection = ({ 
  title, 
  workspaces, 
  activeSessionId, 
  onSelectSession,
  onNewSession,
  onNewWorkspace,
  onOpenSettings,
  defaultExpanded = true,
  sectionType
}: { 
  title: string;
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  onNewWorkspace?: () => void;
  onOpenSettings: (workspaceId: string) => void;
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
                      <DropdownMenuItem className="gap-2 text-sm">
                        <Pencil className="w-3.5 h-3.5" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-sm"
                        onClick={() => onOpenSettings(workspace.id)}
                      >
                        <Settings className="w-3.5 h-3.5" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">
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
                    <div
                      key={session.id}
                      className={cn(
                        "chat-item w-full justify-between group",
                        activeSessionId === session.id && "chat-item-active"
                      )}
                    >
                      <button
                        onClick={() => onSelectSession(workspace.id, session.id)}
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
                          <DropdownMenuItem className="gap-2 text-sm">
                            <Pencil className="w-3.5 h-3.5" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
}: AppSidebarProps) => {
  const navigate = useNavigate();
  const personalWorkspaces = workspaces.filter(w => w.type === 'personal');
  const sharedWorkspaces = workspaces.filter(w => w.type === 'shared');
  const orgWorkspaces = workspaces.filter(w => w.type === 'organization');

  const handleNewWorkspace = () => {
    // TODO: Implement new workspace creation
    console.log('Create new workspace');
  };

  const handleOpenSettings = (workspaceId: string) => {
    navigate(`/settings?workspace=${workspaceId}`);
  };

  return (
    <aside className="flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center px-4 h-14 border-b border-sidebar-border">
        <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
      </div>

      {/* Workspaces */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-sidebar-foreground">
        <WorkspaceSection
          title="My Workspaces"
          workspaces={personalWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onNewWorkspace={handleNewWorkspace}
          onOpenSettings={handleOpenSettings}
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
          onOpenSettings={handleOpenSettings}
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
          onOpenSettings={handleOpenSettings}
          defaultExpanded={true}
          sectionType="organization"
        />
      </nav>
    </aside>
  );
};
