import { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Plus,
  Building2,
  Users,
  FolderOpen,
  Sparkles
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
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'personal':
      return <FolderOpen className={iconClass} />;
    case 'shared':
      return <Users className={iconClass} />;
    case 'organization':
      return <Building2 className={iconClass} />;
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
    <div className="mb-6">
      <h3 className="px-3 py-2 text-[11px] font-semibold text-sidebar-muted uppercase tracking-widest">
        {title}
      </h3>
      <div className="space-y-0.5">
        {workspaces.map((workspace) => (
          <div key={workspace.id}>
            <button
              onClick={() => toggleWorkspace(workspace.id)}
              className="sidebar-item w-full justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sidebar-muted group-hover:text-sidebar-foreground transition-colors">
                  <WorkspaceIcon type={workspace.type} />
                </span>
                <span className="truncate font-medium">{workspace.name}</span>
              </div>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNewSession(workspace.id);
                  }}
                  className="p-1 hover:bg-sidebar-accent rounded-md transition-colors"
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
              <div className="workspace-tree mt-1">
                {workspace.sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onSelectSession(workspace.id, session.id)}
                    className={cn(
                      "sidebar-item w-full text-left group/session",
                      activeSessionId === session.id && "sidebar-item-active"
                    )}
                  >
                    <MessageSquare className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      activeSessionId === session.id ? "text-primary" : "text-sidebar-muted group-hover/session:text-sidebar-foreground"
                    )} />
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
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out",
        isCollapsed ? "w-[68px]" : "w-72"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 border-b border-sidebar-border transition-all",
        isCollapsed ? "justify-center px-2" : "justify-between px-5"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <img src={enplifyLogo} alt="Enplify.ai" className="h-6" />
          </div>
        )}
        {isCollapsed && (
          <div className="icon-wrapper-solid w-9 h-9">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          "absolute top-4 -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-sm",
          "flex items-center justify-center text-muted-foreground hover:text-foreground",
          "transition-all duration-200 hover:shadow-md hover:scale-105 z-10"
        )}
      >
        {isCollapsed ? <PanelLeft className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin">
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
              title="Shared"
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
          <div className="flex flex-col items-center gap-1">
            {[
              { icon: FolderOpen, label: "My Workspaces" },
              { icon: Users, label: "Shared" },
              { icon: Building2, label: "Organization" }
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-sidebar-hover transition-all text-sidebar-muted hover:text-sidebar-foreground"
                title={label}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {!isCollapsed ? (
          <div className="space-y-0.5">
            {[
              { icon: Settings, label: "Settings" },
              { icon: User, label: "My Account" },
            ].map(({ icon: Icon, label }) => (
              <button key={label} className="sidebar-item w-full">
                <Icon className="w-4 h-4 text-sidebar-muted" />
                <span>{label}</span>
              </button>
            ))}
            <button className="sidebar-item w-full text-destructive/80 hover:text-destructive hover:bg-destructive/5">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            {[
              { icon: Settings, label: "Settings" },
              { icon: User, label: "Account" },
            ].map(({ icon: Icon, label }) => (
              <button 
                key={label}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-sidebar-hover transition-all text-sidebar-muted hover:text-sidebar-foreground"
                title={label}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
            <button 
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-destructive/10 transition-all text-sidebar-muted hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
