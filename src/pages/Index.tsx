import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { useChat } from "@/hooks/useChat";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import { Workspace } from "@/types/workspace";
import { WorkspaceDialog } from "@/components/workspace/WorkspaceDialog";
import { DeleteWorkspaceDialog } from "@/components/workspace/DeleteWorkspaceDialog";

const Index = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [activeSessionId, setActiveSessionId] = useState<string | null>("session-1");
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>("personal-1");
  const { messages, isLoading, sendMessage, clearMessages } = useChat();

  // Dialog states
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

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

  const handleCreateWorkspace = () => {
    setSelectedWorkspace(null);
    setDialogMode('create');
    setWorkspaceDialogOpen(true);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setDialogMode('edit');
    setWorkspaceDialogOpen(true);
  };

  const handleDeleteWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setDeleteDialogOpen(true);
  };

  const handleSaveWorkspace = (data: { name: string; type: Workspace['type'] }) => {
    if (dialogMode === 'create') {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`,
        name: data.name,
        type: data.type,
        sessions: [],
      };
      setWorkspaces(prev => [...prev, newWorkspace]);
    } else if (selectedWorkspace) {
      setWorkspaces(prev =>
        prev.map(w =>
          w.id === selectedWorkspace.id
            ? { ...w, name: data.name, type: data.type }
            : w
        )
      );
    }
  };

  const handleConfirmDelete = () => {
    if (selectedWorkspace) {
      setWorkspaces(prev => prev.filter(w => w.id !== selectedWorkspace.id));
      if (activeWorkspaceId === selectedWorkspace.id) {
        setActiveWorkspaceId(null);
        setActiveSessionId(null);
        clearMessages();
      }
      setDeleteDialogOpen(false);
      setSelectedWorkspace(null);
    }
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
        onCreateWorkspace={handleCreateWorkspace}
        onEditWorkspace={handleEditWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
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

      <WorkspaceDialog
        open={workspaceDialogOpen}
        onOpenChange={setWorkspaceDialogOpen}
        workspace={selectedWorkspace}
        onSave={handleSaveWorkspace}
        mode={dialogMode}
      />

      <DeleteWorkspaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workspace={selectedWorkspace}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default Index;
