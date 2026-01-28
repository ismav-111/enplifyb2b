import { Source } from "@/types/workspace";
import { ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SourcesListProps {
  sources: Source[];
}

export const SourcesList = ({ sources }: SourcesListProps) => {
  const [expanded, setExpanded] = useState(false);
  const displaySources = expanded ? sources : sources.slice(0, 3);
  const hasMore = sources.length > 3;

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <FileText className="w-3.5 h-3.5" />
        <span className="font-medium">Sources ({sources.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {displaySources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md",
              "bg-muted/50 hover:bg-muted text-xs text-foreground",
              "transition-colors group"
            )}
            title={source.snippet}
          >
            <span className="max-w-[150px] truncate">{source.title}</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
          </a>
        ))}
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            +{sources.length - 3} more
          </button>
        )}
        {hasMore && expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Show less
          </button>
        )}
      </div>
    </div>
  );
};
