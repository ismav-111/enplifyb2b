import { Document } from "@/types/document";
import { DocumentRow } from "./DocumentRow";
import { Checkbox } from "@/components/ui/checkbox";
import { FileX } from "lucide-react";

interface DocumentsListProps {
  documents: Document[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onView: (document: Document) => void;
  onDelete: (id: string) => void;
}

export const DocumentsList = ({
  documents,
  selectedIds,
  onSelect,
  onSelectAll,
  onView,
  onDelete,
}: DocumentsListProps) => {
  const allSelected = documents.length > 0 && selectedIds.size === documents.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < documents.length;

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileX className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">No documents found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Upload your first document or try adjusting your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-muted/30 sticky top-0">
        <Checkbox
          checked={allSelected}
          ref={(el) => {
            if (el) {
              (el as HTMLButtonElement).dataset.state = someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked";
            }
          }}
          onCheckedChange={(checked) => onSelectAll(checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex-1">
          Name
        </span>
        <span className="hidden sm:block text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
          Uploaded
        </span>
        <div className="w-10" /> {/* Spacer for actions */}
      </div>

      {/* Document rows */}
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          document={doc}
          isSelected={selectedIds.has(doc.id)}
          onSelect={onSelect}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
