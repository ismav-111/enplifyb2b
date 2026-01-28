import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  Folder, 
  Settings, 
  User, 
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Building2,
  Users,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Workspace, ChatSession } from "@/types/workspace";
import enplifyLogo from "@/assets/enplify-logo.png";

interface AppSidebarProps {
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const WorkspaceIcon = ({ type }: { type: Workspace['type'] }) => {
  switch (type) {
    case 'personal':
      return <Briefcase className="w-4 h-4" />;
    case 'shared':
      return <Users className="w-4 h-4" />;
    case 'organization':
      return <Building2 className="w-4 h-4" />;
  }
};

const WorkspaceSection = ({ 
  title, 
  workspaces, 
  activeSessionId, 
  onSelectSession,
  onNewSession,
  isCollapsed
}: { 
  title: string;
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
  isCollapsed: boolean;
}) => {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set(workspaces.map(w => w.id)));

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isCollapsed) return null;

  return (
    <div className="mb-4">
      <h3 className="px-3 py-2 text-xs font-semibold text-sidebar-muted uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-1">
        {workspaces.map((workspace) => (
          <div key={workspace.id}>
            <button
              onClick={() => toggleWorkspace(workspace.id)}
              className="sidebar-item w-full justify-between group"
            >
              <div className="flex items-center gap-2">
                <WorkspaceIcon type={workspace.type} />
                <span className="truncate">{workspace.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewSession(workspace.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-sidebar-accent rounded transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                {expandedWorkspaces.has(workspace.id) ? (
                  <ChevronDown className="w-4 h-4 text-sidebar-muted" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-sidebar-muted" />
                )}
              </div>
            </button>
            {expandedWorkspaces.has(workspace.id) && workspace.sessions.length > 0 && (
              <div className="workspace-tree">
                {workspace.sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(workspace.id, session.id)}
                    className={cn(
                      "sidebar-item w-full text-left",
                      activeSessionId === session.id && "sidebar-item-active"
                    )}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{session.name}</span>
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
  isCollapsed,
  onToggleCollapse
}: AppSidebarProps) => {
  const personalWorkspaces = workspaces.filter(w => w.type === 'personal');
  const sharedWorkspaces = workspaces.filter(w => w.type === 'shared');
  const orgWorkspaces = workspaces.filter(w => w.type === 'organization');

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <img src={enplifyLogo} alt="Enplify.ai" className="h-7" />
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!isCollapsed ? (
          <>
            <WorkspaceSection
              title="My Workspaces"
              workspaces={personalWorkspaces}
              activeSessionId={activeSessionId}
              onSelectSession={onSelectSession}
              onNewSession={onNewSession}
              isCollapsed={isCollapsed}
            />
            <WorkspaceSection
              title="Shared Workspaces"
              workspaces={sharedWorkspaces}
              activeSessionId={activeSessionId}
              onSelectSession={onSelectSession}
              onNewSession={onNewSession}
              isCollapsed={isCollapsed}
            />
            <WorkspaceSection
              title="Organization"
              workspaces={orgWorkspaces}
              activeSessionId={activeSessionId}
              onSelectSession={onSelectSession}
              onNewSession={onNewSession}
              isCollapsed={isCollapsed}
            />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button className="p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <Briefcase className="w-5 h-5 text-sidebar-foreground" />
            </button>
            <button className="p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <Users className="w-5 h-5 text-sidebar-foreground" />
            </button>
            <button className="p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <Building2 className="w-5 h-5 text-sidebar-foreground" />
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        {!isCollapsed ? (
          <div className="space-y-1">
            <button className="sidebar-item w-full">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button className="sidebar-item w-full">
              <User className="w-4 h-4" />
              <span>My Account</span>
            </button>
            <button className="sidebar-item w-full text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button className="p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <Settings className="w-5 h-5 text-sidebar-foreground" />
            </button>
            <button className="p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <User className="w-5 h-5 text-sidebar-foreground" />
            </button>
            <button className="p-2 rounded-md hover:bg-sidebar-accent transition-colors">
              <LogOut className="w-5 h-5 text-destructive" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
