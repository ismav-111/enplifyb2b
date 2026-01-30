import { useState } from "react";
import { X, Trash2, Download, Eye, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import pdfLogo from "@/assets/logos/pdf.svg";
import powerpointLogo from "@/assets/logos/powerpoint.svg";
import excelLogo from "@/assets/logos/excel.svg";

interface Document {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface DocumentManagementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: {
    id: string;
    name: string;
    icon: string;
  } | null;
}

const mockDocuments: Record<string, Document[]> = {
  pdf: [
    { id: "1", name: "Q4 Financial Report.pdf", size: "2.4 MB", uploadedAt: "Jan 15, 2024", uploadedBy: "John Smith" },
    { id: "2", name: "Product Roadmap 2024.pdf", size: "1.8 MB", uploadedAt: "Jan 12, 2024", uploadedBy: "Sarah Connor" },
    { id: "3", name: "Employee Handbook.pdf", size: "4.2 MB", uploadedAt: "Jan 10, 2024", uploadedBy: "Mike Wilson" },
    { id: "4", name: "Marketing Strategy.pdf", size: "3.1 MB", uploadedAt: "Jan 8, 2024", uploadedBy: "John Smith" },
    { id: "5", name: "Legal Compliance Guide.pdf", size: "1.5 MB", uploadedAt: "Jan 5, 2024", uploadedBy: "Sarah Connor" },
  ],
  ppt: [
    { id: "1", name: "Sales Pitch Deck.pptx", size: "5.6 MB", uploadedAt: "Jan 14, 2024", uploadedBy: "Mike Wilson" },
    { id: "2", name: "Quarterly Review.pptx", size: "3.2 MB", uploadedAt: "Jan 11, 2024", uploadedBy: "John Smith" },
    { id: "3", name: "Product Demo.pptx", size: "8.1 MB", uploadedAt: "Jan 9, 2024", uploadedBy: "Sarah Connor" },
  ],
  excel: [
    { id: "1", name: "Budget 2024.xlsx", size: "1.2 MB", uploadedAt: "Jan 13, 2024", uploadedBy: "John Smith" },
    { id: "2", name: "Sales Data Q4.xlsx", size: "2.8 MB", uploadedAt: "Jan 10, 2024", uploadedBy: "Mike Wilson" },
  ],
};

const iconMap: Record<string, string> = {
  pdf: pdfLogo,
  ppt: powerpointLogo,
  excel: excelLogo,
};

export const DocumentManagementSheet = ({
  open,
  onOpenChange,
  documentType,
}: DocumentManagementSheetProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  if (!documentType) return null;

  const documents = mockDocuments[documentType.id] || [];
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredDocuments.map((doc) => doc.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    console.log("Deleting selected:", Array.from(selectedIds));
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  };

  const handleDeleteSingle = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      console.log("Deleting:", documentToDelete.id);
      setDocumentToDelete(null);
    } else if (selectedIds.size > 0) {
      handleDeleteSelected();
    }
    setDeleteDialogOpen(false);
  };

  const allSelected = filteredDocuments.length > 0 && selectedIds.size === filteredDocuments.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < filteredDocuments.length;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50">
                <img
                  src={documentType.icon}
                  alt={`${documentType.name} icon`}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div>
                <SheetTitle className="text-base font-medium">
                  {documentType.name} Documents
                </SheetTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {documents.length} {documents.length === 1 ? "file" : "files"}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Search & Bulk Actions */}
          <div className="px-6 py-3 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-sm bg-background"
                />
              </div>
              {selectedIds.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Delete ({selectedIds.size})
                </Button>
              )}
            </div>
          </div>

          {/* Document List */}
          <div className="flex-1 overflow-y-auto">
            {filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <FileText className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-foreground">No documents found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? "Try a different search term" : "Upload files to get started"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {/* Select All Header */}
                <div className="px-6 py-2.5 bg-muted/20 flex items-center gap-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary"
                    {...(someSelected ? { "data-state": "indeterminate" } : {})}
                  />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Select All
                  </span>
                </div>

                {/* Document Rows */}
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="group px-6 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.has(doc.id)}
                      onCheckedChange={(checked) => handleSelectOne(doc.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} · {doc.uploadedAt} · {doc.uploadedBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSingle(doc)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {documentToDelete ? "Document" : "Documents"}</AlertDialogTitle>
            <AlertDialogDescription>
              {documentToDelete
                ? `Are you sure you want to delete "${documentToDelete.name}"? This action cannot be undone.`
                : `Are you sure you want to delete ${selectedIds.size} selected document${selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
