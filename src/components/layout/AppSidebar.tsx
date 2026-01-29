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
  Trash2,
  FileText,
  MessageSquare
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
  onOpenDocuments: () => void;
}

const WorkspaceIcon = ({ type }: { type: Workspace['type'] }) => {
  switch (type) {
    case 'personal': return <FolderOpen className="w-4 h-4" />;
    case 'shared': return <Users className="w-4 h-4" />;
    case 'organization': return <Building2 className="w-4 h-4" />;
  }
};

const WorkspaceSection = ({ 
  title, 
  workspaces, 
  activeSessionId, 
  onSelectSession,
  onNewSession,
  onNewWorkspace,
  defaultExpanded = true
}: { 
  title: string;
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  onNewWorkspace?: () => void;
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

  if (workspaces.length === 0 && !onNewWorkspace) return null;

  return (
    <div className="mb-2">
      <button 
        onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/50 rounded-lg transition-colors group/header"
      >
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h3>
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
                  className="flex items-center gap-2.5 flex-1 min-w-0"
                >
                  <WorkspaceIcon type={workspace.type} />
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
                      <DropdownMenuItem className="gap-2 text-sm">
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

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    window.location.href = path;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            <button 
              onClick={() => handleNavigation("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              Settings
            </button>
            <button 
              onClick={() => handleNavigation("/settings")}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
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

      {/* User Profile Button */}
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
  onOpenDocuments,
}: AppSidebarProps) => {
  const personalWorkspaces = workspaces.filter(w => w.type === 'personal');
  const sharedWorkspaces = workspaces.filter(w => w.type === 'shared');
  const orgWorkspaces = workspaces.filter(w => w.type === 'organization');

  const handleNewWorkspace = () => {
    // TODO: Implement new workspace creation
    console.log('Create new workspace');
  };

  return (
    <aside className="flex flex-col h-screen w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center px-4 h-14 border-b border-border">
        <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
      </div>

      {/* Documents Button */}
      <div className="px-2 pt-3 pb-2 border-b border-border">
        <button
          onClick={onOpenDocuments}
          className="nav-item w-full"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm">Documents</span>
        </button>
      </div>

      {/* Workspaces */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <WorkspaceSection
          title="My Workspaces"
          workspaces={personalWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          onNewWorkspace={handleNewWorkspace}
          defaultExpanded={true}
        />
        <WorkspaceSection
          title="Shared Workspaces"
          workspaces={sharedWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
          defaultExpanded={true}
        />
        <WorkspaceSection
          title="Organization Workspaces"
          workspaces={orgWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
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
