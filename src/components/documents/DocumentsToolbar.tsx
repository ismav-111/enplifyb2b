import { Filter, ArrowUpDown, LayoutGrid, LayoutList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { DocumentType } from "@/types/document";
import { cn } from "@/lib/utils";

export type SortOption = "name" | "date" | "size";
export type SortDirection = "asc" | "desc";
export type ViewMode = "list" | "grid";

interface DocumentsToolbarProps {
  // Filters
  activeTypeFilters: DocumentType[];
  onTypeFilterChange: (types: DocumentType[]) => void;
  // Sorting
  sortBy: SortOption;
  sortDirection: SortDirection;
  onSortChange: (sortBy: SortOption, direction: SortDirection) => void;
  // View
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  // Results info
  totalCount: number;
  filteredCount: number;
}

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Word" },
  { value: "ppt", label: "PowerPoint" },
  { value: "excel", label: "Excel" },
  { value: "image", label: "Images" },
  { value: "other", label: "Other" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "date", label: "Date uploaded" },
  { value: "size", label: "File size" },
];

export const DocumentsToolbar = ({
  activeTypeFilters,
  onTypeFilterChange,
  sortBy,
  sortDirection,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}: DocumentsToolbarProps) => {
  const hasActiveFilters = activeTypeFilters.length > 0;

  const handleTypeToggle = (type: DocumentType) => {
    if (activeTypeFilters.includes(type)) {
      onTypeFilterChange(activeTypeFilters.filter((t) => t !== type));
    } else {
      onTypeFilterChange([...activeTypeFilters, type]);
    }
  };

  const clearFilters = () => {
    onTypeFilterChange([]);
  };

  const handleSortSelect = (option: SortOption) => {
    if (sortBy === option) {
      // Toggle direction
      onSortChange(option, sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New sort, default to ascending for name, descending for date/size
      onSortChange(option, option === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-muted/20">
      <div className="flex items-center gap-2">
        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", hasActiveFilters && "border-primary text-primary")}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                  {activeTypeFilters.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              File Type
            </DropdownMenuLabel>
            {documentTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type.value}
                checked={activeTypeFilters.includes(type.value)}
                onCheckedChange={() => handleTypeToggle(type.value)}
              >
                {type.label}
              </DropdownMenuCheckboxItem>
            ))}
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-4 h-4 mr-2" />
                  Clear filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className={cn(sortBy === option.value && "bg-accent")}
              >
                <span className="flex-1">{option.label}</span>
                {sortBy === option.value && (
                  <span className="text-xs text-muted-foreground">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-1 ml-2">
            {activeTypeFilters.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
              >
                {documentTypes.find((t) => t.value === type)?.label}
                <button
                  onClick={() => handleTypeToggle(type)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Results count */}
        <span className="text-sm text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount} documents`
            : `${filteredCount} of ${totalCount} documents`}
        </span>

        {/* View toggle */}
        <div className="flex items-center border border-border rounded-md">
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 transition-colors",
              viewMode === "list"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 transition-colors",
              viewMode === "grid"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
