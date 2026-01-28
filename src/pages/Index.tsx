import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { mockWorkspaces } from "@/data/mockWorkspaces";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>("session-1");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>("personal-1");
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  const handleSelectSession = (workspaceId: string, sessionId: string) => {
    if (sessionId !== activeSessionId) {
      clearMessages();
    }
    setActiveWorkspaceId(workspaceId);
    setActiveSessionId(sessionId);
  };

  const handleNewSession = (workspaceId: string) => {
    clearMessages();
    setActiveWorkspaceId(workspaceId);
    setActiveSessionId(null);
  };

  const activeWorkspace = mockWorkspaces.find(w => w.id === activeWorkspaceId);
  const activeSession = activeWorkspace?.sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar
        workspaces={mockWorkspaces}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 min-w-0">
        <ChatArea
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          workspaceName={activeWorkspace?.name}
          sessionName={activeSession?.name}
        />
      </main>
    </div>
  );
};

export default Index;
