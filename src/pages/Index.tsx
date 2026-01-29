import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { SourcesSidebar } from "@/components/chat/SourcesSidebar";
import { DocumentsDrawer } from "@/components/documents/DocumentsDrawer";
import { useChat } from "@/hooks/useChat";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import { Source } from "@/types/workspace";

const Index = () => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>("session-1");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>("personal-1");
  const { messages, isLoading, sendMessage, clearMessages, editMessage, regenerateResponse } = useChat();
  
  // Sources sidebar state
  const [sourcesSidebarOpen, setSourcesSidebarOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Source[]>([]);

  // Documents drawer state
  const [documentsOpen, setDocumentsOpen] = useState(false);

  const handleSelectSession = (workspaceId: string, sessionId: string) => {
    if (sessionId !== activeSessionId) {
      clearMessages();
    }
    setActiveWorkspaceId(workspaceId);
    setActiveSessionId(sessionId);
    setSourcesSidebarOpen(false);
    setDocumentsOpen(false);
  };

  const handleNewSession = (workspaceId: string) => {
    clearMessages();
    setActiveWorkspaceId(workspaceId);
    setActiveSessionId(null);
    setSourcesSidebarOpen(false);
    setDocumentsOpen(false);
  };

  const handleViewSources = (sources: Source[]) => {
    setActiveSources(sources);
    setSourcesSidebarOpen(true);
    setDocumentsOpen(false);
  };

  const handleOpenDocuments = () => {
    setDocumentsOpen(true);
    setSourcesSidebarOpen(false);
  };

  const activeWorkspace = mockWorkspaces.find(w => w.id === activeWorkspaceId);
  const activeSession = activeWorkspace?.sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar
        workspaces={mockWorkspaces}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onOpenDocuments={handleOpenDocuments}
      />
      <main className="flex-1 min-w-0">
        <ChatArea
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isLoading}
          workspaceName={activeWorkspace?.name}
          sessionName={activeSession?.name}
          onViewSources={handleViewSources}
          onEditMessage={editMessage}
          onRegenerateResponse={regenerateResponse}
        />
      </main>
      <SourcesSidebar 
        sources={activeSources}
        isOpen={sourcesSidebarOpen}
        onClose={() => setSourcesSidebarOpen(false)}
      />
      <DocumentsDrawer
        isOpen={documentsOpen}
        onClose={() => setDocumentsOpen(false)}
      />
    </div>
  );
};

export default Index;
