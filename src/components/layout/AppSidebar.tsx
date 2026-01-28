import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut,
  FolderOpen,
  Users,
  Building2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Workspace } from "@/types/workspace";
import enplifyLogo from "@/assets/enplify-logo.png";

interface AppSidebarProps {
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
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
  onNewSession
}: { 
  title: string;
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
}) => {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(workspaces.map(w => w.id))
  );

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (workspaces.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-0.5">
        {workspaces.map((workspace) => (
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
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-sm">{session.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const AppSidebar = ({
  workspaces,
  activeSessionId,
  onSelectSession,
  onNewSession,
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
        />
        <WorkspaceSection
          title="Shared Workspaces"
          workspaces={sharedWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
        />
        <WorkspaceSection
          title="Organization Workspaces"
          workspaces={orgWorkspaces}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewSession={onNewSession}
        />
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-border p-2 space-y-0.5">
        <button className="nav-item w-full">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <button className="nav-item w-full">
          <User className="w-4 h-4" />
          <span>My Account</span>
        </button>
        <button className="nav-item w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
