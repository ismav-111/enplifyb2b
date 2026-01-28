import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  User, 
  LogOut,
  FolderOpen,
  Users,
  Building2,
  Plus,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Workspace } from "@/types/workspace";
import enplifyLogo from "@/assets/enplify-logo.png";

interface AppSidebarProps {
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspace: Workspace) => void;
}

const WorkspaceIcon = ({ type }: { type: Workspace['type'] }) => {
  switch (type) {
    case 'personal': return <FolderOpen className="w-4 h-4" />;
    case 'shared': return <Users className="w-4 h-4" />;
    case 'organization': return <Building2 className="w-4 h-4" />;
  }
};

const WorkspaceMenu = ({ 
  workspace, 
  onEdit, 
  onDelete 
}: { 
  workspace: Workspace; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
        title="More options"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[140px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const WorkspaceSection = ({ 
  title, 
  workspaces, 
  activeSessionId, 
  onSelectSession,
  onNewSession,
  onEditWorkspace,
  onDeleteWorkspace,
  onCreateWorkspace,
  showCreateButton = false,
  defaultExpanded = true
}: { 
  title: string;
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
  showCreateButton?: boolean;
  defaultExpanded?: boolean;
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

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between px-3 py-2 group">
        <button 
          onClick={() => setIsSectionExpanded(!isSectionExpanded)}
          className="flex items-center gap-1 hover:bg-accent/50 rounded transition-colors"
        >
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          {isSectionExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
        {showCreateButton && (
          <button
            onClick={onCreateWorkspace}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
            title="Create workspace"
          >
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
      
      {isSectionExpanded && (
        <div className="space-y-0.5 mt-1">
          {workspaces.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No workspaces</p>
          ) : (
            workspaces.map((workspace) => (
              <div key={workspace.id}>
                <button
                  onClick={() => toggleWorkspace(workspace.id)}
                  className="nav-item w-full justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <WorkspaceIcon type={workspace.type} />
                    <span className="truncate text-sm">{workspace.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
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
                    <WorkspaceMenu 
                      workspace={workspace}
                      onEdit={() => onEditWorkspace(workspace)}
                      onDelete={() => onDeleteWorkspace(workspace)}
                    />
                    {expandedWorkspaces.has(workspace.id) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                {expandedWorkspaces.has(workspace.id) && workspace.sessions.length > 0 && (
                  <div className="ml-4 pl-3 border-l border-border space-y-0.5 mt-1">
                    {workspace.sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => onSelectSession(workspace.id, session.id)}
                        className={cn(
                          "chat-item w-full text-left",
                          activeSessionId === session.id && "chat-item-active"
                        )}
                      >
                        <span className="truncate text-sm">{session.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors">
              <User className="w-4 h-4 text-muted-foreground" />
              My Account
            </button>
            <div className="h-px bg-border my-1" />
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
          JD
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate">John Doe</p>
          <p className="text-xs text-muted-foreground truncate">john@company.com</p>
        </div>
        <ChevronUp className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          !isOpen && "rotate-180"
        )} />
      </button>
    </div>
  );
};

export const AppSidebar = ({
  workspaces,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onCreateWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
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
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <WorkspaceSection
          title="My Workspaces"
          workspaces={personalWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          showCreateButton={true}
          defaultExpanded={true}
        />
        <WorkspaceSection
          title="Shared Workspaces"
          workspaces={sharedWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          defaultExpanded={true}
        />
        <WorkspaceSection
          title="Organization Workspaces"
          workspaces={orgWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          defaultExpanded={true}
        />
      </nav>

      {/* User Profile & Menu */}
      <div className="border-t border-border p-2">
        <UserMenu />
      </div>
    </aside>
  );
};
