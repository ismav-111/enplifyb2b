import { useState, useMemo } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { mockDocuments } from "@/data/mockDocuments";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import { Document } from "@/types/document";
import { useToast } from "@/hooks/use-toast";

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter((doc) =>
      doc.name.toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIds(new Set(filteredDocuments.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({
      title: "Document deleted",
      description: "The document has been removed.",
    });
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    setDocuments((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    toast({
      title: `${count} document${count > 1 ? "s" : ""} deleted`,
      description: "The selected documents have been removed.",
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    toast({
      title: "Upload",
      description: "File upload coming soon.",
    });
  };

  const handleView = (document: Document) => {
    // TODO: Implement document preview
    toast({
      title: "Preview",
      description: `Opening ${document.name}...`,
    });
  };

  // Sidebar handlers (not used on this page but required by component)
  const handleSelectSession = () => {};
  const handleNewSession = () => {};

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <AppSidebar
        workspaces={mockWorkspaces}
        activeSessionId={null}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <DocumentsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedIds.size}
          onDeleteSelected={handleDeleteSelected}
          onClearSelection={handleClearSelection}
          onUpload={handleUpload}
        />
        <DocumentsList
          documents={filteredDocuments}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onView={handleView}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
};

export default Documents;
