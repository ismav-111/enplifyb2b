import { useState } from "react";
import { 
  Home, 
  TrendingUp, 
  Inbox, 
  BookOpen,
  Settings, 
  Users,
  Zap,
  Plus,
  ChevronDown,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Workspace, ChatSession } from "@/types/workspace";
import enplifyLogo from "@/assets/enplify-logo.png";

interface AppSidebarProps {
  workspaces: Workspace[];
  activeSessionId: string | null;
  onSelectSession: (workspaceId: string, sessionId: string) => void;
  onNewSession: (workspaceId: string) => void;
}

export const AppSidebar = ({
  workspaces,
  activeSessionId,
  onSelectSession,
  onNewSession,
}: AppSidebarProps) => {
  const allSessions = workspaces.flatMap(w => 
    w.sessions.map(s => ({ ...s, workspaceId: w.id }))
  ).slice(0, 5);

  return (
    <aside className="flex flex-col h-screen w-64 bg-sidebar border-r border-sidebar-border">
      {/* Header with logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
        <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
      </div>

      {/* New Chat Button */}
      <div className="px-3 pt-4 pb-2">
        <button 
          onClick={() => onNewSession(workspaces[0]?.id || '')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 py-2">
        <button className="nav-item nav-item-active w-full">
          <Home className="w-4 h-4" />
          Home
        </button>
      </nav>

      {/* Other Section */}
      <div className="px-3 py-2">
        <p className="px-3 py-2 text-[11px] font-medium text-sidebar-muted uppercase tracking-wider">
          Other
        </p>
        <button className="nav-item w-full">
          <TrendingUp className="w-4 h-4" />
          Performance
        </button>
        <button className="nav-item w-full justify-between">
          <span className="flex items-center gap-3">
            <Inbox className="w-4 h-4" />
            Inbox
          </span>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
            2
          </span>
        </button>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-medium text-sidebar-muted uppercase tracking-wider">
          Recent Chats
        </p>
        <button className="nav-item w-full">
          <BookOpen className="w-4 h-4" />
          Library
        </button>
        <div className="mt-1 space-y-0.5">
          {allSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.workspaceId, session.id)}
              className={cn(
                "chat-item w-full text-left truncate",
                activeSessionId === session.id && "chat-item-active"
              )}
            >
              <span className="truncate pl-1">{session.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Section */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <p className="px-3 py-2 text-[11px] font-medium text-sidebar-muted uppercase tracking-wider">
          Settings
        </p>
        <button className="nav-item w-full">
          <Zap className="w-4 h-4" />
          Integration
        </button>
        <button className="nav-item w-full">
          <Users className="w-4 h-4" />
          Team Member
        </button>
        <button className="nav-item w-full">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
            AS
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-sidebar-accent-foreground">Alex Satrio</p>
            <p className="text-xs text-sidebar-muted">Lead Product Design</p>
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-muted" />
        </button>
      </div>
    </aside>
  );
};
