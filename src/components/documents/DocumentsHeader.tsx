import { Search, Upload, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocumentsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onUpload: () => void;
}

export const DocumentsHeader = ({
  searchQuery,
  onSearchChange,
  selectedCount,
  onDeleteSelected,
  onClearSelection,
  onUpload,
}: DocumentsHeaderProps) => {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-col gap-4 p-6 border-b border-border">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your uploaded files and documents
          </p>
        </div>
        <Button onClick={onUpload} className="gap-2">
          <Upload className="w-4 h-4" />
          Upload
        </Button>
      </div>

      {/* Search and bulk actions row */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Bulk actions - shown when items selected */}
        {hasSelection && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              className="gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
