import { useState, useMemo } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DocumentsHeader } from "@/components/documents/DocumentsHeader";
import { DocumentsToolbar, SortOption, SortDirection, ViewMode } from "@/components/documents/DocumentsToolbar";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { DocumentsGrid } from "@/components/documents/DocumentsGrid";
import { DocumentsPagination } from "@/components/documents/DocumentsPagination";
import { mockDocuments } from "@/data/mockDocuments";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import { Document, DocumentType } from "@/types/document";
import { useToast } from "@/hooks/use-toast";

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Filters
  const [typeFilters, setTypeFilters] = useState<DocumentType[]>([]);

  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter, sort, and paginate documents
  const processedDocuments = useMemo(() => {
    let result = [...documents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((doc) => doc.name.toLowerCase().includes(query));
    }

    // Type filter
    if (typeFilters.length > 0) {
      result = result.filter((doc) => typeFilters.includes(doc.type));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "date":
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case "size":
          comparison = a.size - b.size;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [documents, searchQuery, typeFilters, sortBy, sortDirection]);

  // Paginated documents
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedDocuments.slice(startIndex, startIndex + pageSize);
  }, [processedDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(processedDocuments.length / pageSize);

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (types: DocumentType[]) => {
    setTypeFilters(types);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: SortOption, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

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
      setSelectedIds(new Set(paginatedDocuments.map((d) => d.id)));
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
    toast({
      title: "Upload",
      description: "File upload coming soon.",
    });
  };

  const handleView = (document: Document) => {
    toast({
      title: "Preview",
      description: `Opening ${document.name}...`,
    });
  };

  // Sidebar handlers
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
          onSearchChange={handleSearchChange}
          selectedCount={selectedIds.size}
          onDeleteSelected={handleDeleteSelected}
          onClearSelection={handleClearSelection}
          onUpload={handleUpload}
        />
        <DocumentsToolbar
          activeTypeFilters={typeFilters}
          onTypeFilterChange={handleTypeFilterChange}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={documents.length}
          filteredCount={processedDocuments.length}
        />
        <div className="flex-1 overflow-auto">
          {viewMode === "list" ? (
            <DocumentsList
              documents={paginatedDocuments}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onView={handleView}
              onDelete={handleDelete}
            />
          ) : (
            <DocumentsGrid
              documents={paginatedDocuments}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onView={handleView}
              onDelete={handleDelete}
            />
          )}
        </div>
        <DocumentsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={processedDocuments.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </main>
    </div>
  );
};

export default Documents;
