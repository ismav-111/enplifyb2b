import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { SourcesSidebar } from "@/components/chat/SourcesSidebar";
import { DocumentsDrawer } from "@/components/documents/DocumentsDrawer";
import { useChat } from "@/hooks/useChat";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import { mockDocuments } from "@/data/mockDocuments";
import { Source, Workspace, ChatSession } from "@/types/workspace";
import { CreateWorkspaceDialog } from "@/components/settings/workspace/CreateWorkspaceDialog";
import { EditWorkspaceDialog } from "@/components/settings/workspace/EditWorkspaceDialog";
import { DeleteWorkspaceDialog } from "@/components/settings/workspace/DeleteWorkspaceDialog";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>("session-1");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>("personal-1");
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const { messages, isLoading, sendMessage, clearMessages, editMessage, regenerateResponse } = useChat();
  
  // Sources sidebar state
  const [sourcesSidebarOpen, setSourcesSidebarOpen] = useState(false);
  const [activeSources, setActiveSources] = useState<Source[]>([]);

  // Documents drawer state
  const [documentsOpen, setDocumentsOpen] = useState(false);

  // Workspace dialog state
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  const [createWorkspaceType, setCreateWorkspaceType] = useState<"personal" | "shared" | "organization">("personal");
  const [editWorkspaceOpen, setEditWorkspaceOpen] = useState(false);
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

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
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      name: "New Chat",
      createdAt: new Date(),
    };
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId 
        ? { ...w, sessions: [newSession, ...w.sessions] }
        : w
    ));
    setActiveWorkspaceId(workspaceId);
    setActiveSessionId(newSession.id);
    clearMessages();
    toast.success("New chat created");
  };

  // Workspace CRUD handlers
  const handleNewWorkspace = (type: "personal" | "shared" | "organization") => {
    setCreateWorkspaceType(type);
    setCreateWorkspaceOpen(true);
  };

  const handleCreateWorkspace = (workspace: { name: string; description: string; type: "personal" | "shared" | "organization" }) => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name: workspace.name,
      type: workspace.type,
      sessions: [],
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    toast.success(`Workspace "${workspace.name}" created`);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setEditWorkspaceOpen(true);
  };

  const handleSaveWorkspace = (workspaceId: string, updates: { name: string; description?: string }) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, name: updates.name } : w
    ));
    toast.success("Workspace updated");
  };

  const handleDeleteWorkspaceClick = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setDeleteWorkspaceOpen(true);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    if (activeWorkspaceId === workspaceId) {
      setActiveWorkspaceId(null);
      setActiveSessionId(null);
    }
    toast.success("Workspace deleted");
  };

  const handleOpenWorkspaceSettings = (workspace: Workspace) => {
    navigate(`/settings?workspace=${workspace.id}`);
  };

  // Session CRUD handlers
  const handleRenameSession = (workspaceId: string, sessionId: string, newName: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId 
        ? { ...w, sessions: w.sessions.map(s => s.id === sessionId ? { ...s, name: newName } : s) }
        : w
    ));
    toast.success("Chat renamed");
  };

  const handleDeleteSession = (workspaceId: string, sessionId: string) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId 
        ? { ...w, sessions: w.sessions.filter(s => s.id !== sessionId) }
        : w
    ));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      clearMessages();
    }
    toast.success("Chat deleted");
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

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const activeSession = activeWorkspace?.sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar
        workspaces={workspaces}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onNewWorkspace={handleNewWorkspace}
        onEditWorkspace={handleEditWorkspace}
        onDeleteWorkspace={handleDeleteWorkspaceClick}
        onOpenWorkspaceSettings={handleOpenWorkspaceSettings}
        onRenameSession={handleRenameSession}
        onDeleteSession={handleDeleteSession}
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
          onOpenDocuments={handleOpenDocuments}
          documentCount={mockDocuments.length}
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

      {/* Workspace Dialogs */}
      <CreateWorkspaceDialog
        open={createWorkspaceOpen}
        onOpenChange={setCreateWorkspaceOpen}
        workspaceType={createWorkspaceType}
        onCreateWorkspace={handleCreateWorkspace}
      />
      <EditWorkspaceDialog
        open={editWorkspaceOpen}
        onOpenChange={setEditWorkspaceOpen}
        workspace={selectedWorkspace}
        onSaveWorkspace={handleSaveWorkspace}
      />
      <DeleteWorkspaceDialog
        open={deleteWorkspaceOpen}
        onOpenChange={setDeleteWorkspaceOpen}
        workspace={selectedWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
      />
    </div>
  );
};

export default Index;
