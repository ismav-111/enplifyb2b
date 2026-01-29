import { Source } from "@/types/workspace";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourcesSidebarProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

// Extract domain from URL
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "").toUpperCase();
  } catch {
    return "SOURCE";
  }
};

// Get source type label
const getSourceType = (url: string) => {
  const domain = url.toLowerCase();
  if (domain.includes("github")) return "CODE REPOSITORY";
  if (domain.includes("docs") || domain.includes("documentation")) return "DOCUMENTATION";
  if (domain.includes("research") || domain.includes("arxiv")) return "RESEARCH PAPER";
  if (domain.includes("slides") || domain.includes("presentation")) return "RESEARCH PRESENTATION";
  return getDomain(url);
};

export const SourcesSidebar = ({ sources, isOpen, onClose }: SourcesSidebarProps) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed right-0 top-0 h-full w-80 bg-background border-l border-border z-50",
          "transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:z-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Sources</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sources list */}
        <div className="overflow-y-auto h-[calc(100%-57px)]">
          <div className="divide-y divide-border">
            {/* Deduplicate sources by URL */}
            {sources
              .filter((source, index, self) => 
                index === self.findIndex(s => s.url === source.url)
              )
              .map((source, index) => (
              <div key={index} className="px-5 py-4">
                {/* Source type / domain */}
                <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
                  {getSourceType(source.url)}
                </span>
                
                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground mt-1.5 leading-snug">
                  {source.title}
                </h3>
                
                {/* Link */}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-1.5"
                >
                  View source
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                {/* Snippet */}
                {source.snippet && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {source.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
