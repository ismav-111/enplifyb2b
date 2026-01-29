import { Document } from "@/types/document";
import { DocumentIcon } from "./DocumentIcon";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Download, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DocumentsGridProps {
  documents: Document[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onView: (document: Document) => void;
  onDelete: (id: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const DocumentsGrid = ({
  documents,
  selectedIds,
  onSelect,
  onView,
  onDelete,
}: DocumentsGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6">
      {documents.map((doc) => {
        const isSelected = selectedIds.has(doc.id);
        return (
          <div
            key={doc.id}
            className={cn(
              "group relative flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer",
              isSelected && "border-primary bg-primary/5"
            )}
            onClick={() => onView(doc)}
          >
            {/* Checkbox */}
            <div
              className="absolute top-2 left-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(doc.id, checked as boolean)}
                className={cn(
                  "data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-opacity",
                  !isSelected && "opacity-0 group-hover:opacity-100"
                )}
              />
            </div>

            {/* Actions */}
            <div
              className="absolute top-2 right-2"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onView(doc)} className="gap-2 text-sm">
                    <Eye className="w-4 h-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(doc.id)}
                    className="gap-2 text-sm text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Icon */}
            <DocumentIcon type={doc.type} className="w-14 h-14 mb-3" />

            {/* Name */}
            <p className="text-sm font-medium text-foreground text-center truncate w-full">
              {doc.name}
            </p>

            {/* Meta */}
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
            </p>
          </div>
        );
      })}
    </div>
  );
};
