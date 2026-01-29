import { Source } from "@/types/workspace";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

interface SourcesListProps {
  sources: Source[];
}

// Generate a favicon URL from a source URL
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

// Get initials from title for fallback
const getInitials = (title: string) => {
  return title.charAt(0).toUpperCase();
};

// Generate a consistent color based on string
const getColorFromString = (str: string) => {
  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const SourcesList = ({ sources }: SourcesListProps) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const displayCount = Math.min(sources.length, 5);
  const displaySources = sources.slice(0, displayCount);
  const hasMore = sources.length > 5;

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center gap-3">
        {/* Stacked source icons */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex items-center -space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
              {displaySources.map((source, index) => {
                const faviconUrl = getFaviconUrl(source.url);
                const showFallback = !faviconUrl || imageErrors.has(index);
                
                return (
                  <TooltipProvider key={index} delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full border-2 border-background flex items-center justify-center overflow-hidden",
                            "shadow-sm hover:z-10 hover:scale-110 transition-transform",
                            showFallback ? getColorFromString(source.title) : "bg-white"
                          )}
                          style={{ zIndex: displayCount - index }}
                        >
                          {!showFallback ? (
                            <img
                              src={faviconUrl}
                              alt={source.title}
                              className="w-4 h-4 object-contain"
                              onError={() => handleImageError(index)}
                            />
                          ) : (
                            <span className="text-xs font-medium text-white">
                              {getInitials(source.title)}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="text-xs font-medium truncate">{source.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
              {hasMore && (
                <div
                  className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-sm"
                  style={{ zIndex: 0 }}
                >
                  <span className="text-[10px] font-medium text-muted-foreground">
                    +{sources.length - 5}
                  </span>
                </div>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Sources ({sources.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sources.map((source, index) => {
                const faviconUrl = getFaviconUrl(source.url);
                const showFallback = !faviconUrl || imageErrors.has(index);
                
                return (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        showFallback ? getColorFromString(source.title) : "bg-muted"
                      )}
                    >
                      {!showFallback ? (
                        <img
                          src={faviconUrl}
                          alt={source.title}
                          className="w-5 h-5 object-contain"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <span className="text-sm font-medium text-white">
                          {getInitials(source.title)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {source.title}
                      </p>
                      {source.snippet && (
                        <p className="text-xs text-muted-foreground truncate">
                          {source.snippet}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </a>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Sources label */}
        <span className="text-xs text-muted-foreground font-medium">Sources</span>
      </div>
    </div>
  );
};
