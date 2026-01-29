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

interface DocumentRowProps {
  document: Document;
  isSelected: boolean;
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
    year: "numeric",
  }).format(date);
};

export const DocumentRow = ({
  document,
  isSelected,
  onSelect,
  onView,
  onDelete,
}: DocumentRowProps) => {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-accent/50 transition-colors cursor-pointer",
        isSelected && "bg-primary/5"
      )}
      onClick={() => onView(document)}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(document.id, checked as boolean)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </div>

      {/* Icon */}
      <DocumentIcon type={document.type} className="w-10 h-10 shrink-0" />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{document.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(document.size)}</p>
      </div>

      {/* Date */}
      <div className="hidden sm:block text-sm text-muted-foreground w-28">
        {formatDate(document.uploadedAt)}
      </div>

      {/* Actions */}
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-all">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onView(document)} className="gap-2 text-sm">
              <Eye className="w-4 h-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm">
              <Download className="w-4 h-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(document.id)}
              className="gap-2 text-sm text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
