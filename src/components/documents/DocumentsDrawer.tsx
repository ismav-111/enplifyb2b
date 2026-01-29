import { useState, useMemo } from "react";
import { X, Search, Upload, Trash2, Filter, ArrowUpDown, LayoutGrid, LayoutList, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Document, DocumentType } from "@/types/document";
import { DocumentIcon } from "./DocumentIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockDocuments } from "@/data/mockDocuments";

type SortOption = "name" | "date" | "size";
type SortDirection = "asc" | "desc";
type ViewMode = "list" | "grid";

interface DocumentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Word" },
  { value: "ppt", label: "PowerPoint" },
  { value: "excel", label: "Excel" },
  { value: "image", label: "Images" },
  { value: "other", label: "Other" },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const DocumentsDrawer = ({ isOpen, onClose }: DocumentsDrawerProps) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<DocumentType[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  // Process documents
  const processedDocuments = useMemo(() => {
    let result = [...documents];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((doc) => doc.name.toLowerCase().includes(query));
    }

    if (typeFilters.length > 0) {
      result = result.filter((doc) => typeFilters.includes(doc.type));
    }

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

  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedDocuments.slice(startIndex, startIndex + pageSize);
  }, [processedDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(processedDocuments.length / pageSize);

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selected ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? new Set(paginatedDocuments.map((d) => d.id)) : new Set());
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    toast({ title: "Document deleted", description: "The document has been removed." });
  };

  const handleDeleteSelected = () => {
    const count = selectedIds.size;
    setDocuments((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    setSelectedIds(new Set());
    toast({ title: `${count} document${count > 1 ? "s" : ""} deleted`, description: "The selected documents have been removed." });
  };

  const handleTypeToggle = (type: DocumentType) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const handleSortSelect = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(option);
      setSortDirection(option === "name" ? "asc" : "desc");
    }
  };

  const handleUpload = () => {
    toast({ title: "Upload", description: "File upload coming soon." });
  };

  const handleView = (doc: Document) => {
    toast({ title: "Preview", description: `Opening ${doc.name}...` });
  };

  const hasActiveFilters = typeFilters.length > 0;
  const allSelected = paginatedDocuments.length > 0 && selectedIds.size === paginatedDocuments.length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-[480px] max-w-[90vw] bg-background border-l border-border z-50",
          "transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Documents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {processedDocuments.length} of {documents.length} files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleUpload} size="sm" className="gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Upload
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-4 py-3 border-b border-border space-y-3 shrink-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9 bg-muted/50"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("gap-1.5 h-8", hasActiveFilters && "border-primary text-primary")}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filter
                    {hasActiveFilters && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded">
                        {typeFilters.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuLabel className="text-xs">File Type</DropdownMenuLabel>
                  {documentTypes.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type.value}
                      checked={typeFilters.includes(type.value)}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                    >
                      {type.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                  {hasActiveFilters && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTypeFilters([])}>
                        <X className="w-3.5 h-3.5 mr-2" />
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {[
                    { value: "name" as SortOption, label: "Name" },
                    { value: "date" as SortOption, label: "Date" },
                    { value: "size" as SortOption, label: "Size" },
                  ].map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => handleSortSelect(opt.value)}
                      className={cn(sortBy === opt.value && "bg-accent")}
                    >
                      <span className="flex-1">{opt.label}</span>
                      {sortBy === opt.value && (
                        <span className="text-xs text-muted-foreground">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bulk delete */}
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 h-8"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete ({selectedIds.size})
                </Button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center border border-border rounded-md">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Document List/Grid */}
        <div className="flex-1 overflow-auto">
          {paginatedDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No documents found</p>
            </div>
          ) : viewMode === "list" ? (
            <div>
              {/* List header */}
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-muted/30 sticky top-0">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex-1">
                  Name
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-20 hidden sm:block">
                  Date
                </span>
              </div>
              {/* List rows */}
              {paginatedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer",
                    selectedIds.has(doc.id) && "bg-primary/5"
                  )}
                  onClick={() => handleView(doc)}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(doc.id)}
                      onCheckedChange={(checked) => handleSelect(doc.id, checked as boolean)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <DocumentIcon type={doc.type} className="w-8 h-8 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatFileSize(doc.size)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground w-20 hidden sm:block">
                    {formatDate(doc.uploadedAt)}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem onClick={() => handleView(doc)} className="gap-2 text-sm">
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-sm">
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(doc.id)}
                          className="gap-2 text-sm text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid view */
            <div className="grid grid-cols-2 gap-3 p-4">
              {paginatedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "group relative flex flex-col items-center p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer",
                    selectedIds.has(doc.id) && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleView(doc)}
                >
                  <div
                    className="absolute top-2 left-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds.has(doc.id)}
                      onCheckedChange={(checked) => handleSelect(doc.id, checked as boolean)}
                      className={cn(
                        "data-[state=checked]:bg-primary transition-opacity",
                        !selectedIds.has(doc.id) && "opacity-0 group-hover:opacity-100"
                      )}
                    />
                  </div>
                  <DocumentIcon type={doc.type} className="w-10 h-10 mb-2" />
                  <p className="text-xs font-medium text-foreground text-center truncate w-full">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatFileSize(doc.size)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {processedDocuments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rows:</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-14 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, processedDocuments.length)} of {processedDocuments.length}
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
