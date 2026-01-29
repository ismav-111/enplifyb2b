import { Source } from "@/types/workspace";
import { X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SourcesSidebarProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

// Extract domain from URL
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "source";
  }
};

// Get favicon URL from domain
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

// Get source type label based on URL patterns
const getSourceType = (url: string) => {
  const domain = url.toLowerCase();
  if (domain.includes("github")) return "Code Repository";
  if (domain.includes("docs") || domain.includes("documentation")) return "Documentation";
  if (domain.includes("research") || domain.includes("arxiv")) return "Research Paper";
  if (domain.includes("slides") || domain.includes("presentation")) return "Presentation";
  if (domain.includes("analytics")) return "Analytics";
  if (domain.includes("dashboard")) return "Dashboard";
  if (domain.includes("finance")) return "Financial Report";
  return "Web Source";
};

export const SourcesSidebar = ({ sources, isOpen, onClose }: SourcesSidebarProps) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // Deduplicate sources by URL
  const uniqueSources = sources.filter((source, index, self) => 
    index === self.findIndex(s => s.url === source.url)
  );

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
          <div className="p-3 space-y-2">
            {uniqueSources.map((source, index) => {
              const faviconUrl = getFaviconUrl(source.url);
              const showFallback = !faviconUrl || imageErrors.has(index);
              
              return (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all duration-200 cursor-default"
                >
                  {/* Clickable favicon + domain link */}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    {/* Favicon */}
                    <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                      {!showFallback ? (
                        <img
                          src={faviconUrl}
                          alt=""
                          className="w-4 h-4 object-contain"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {getDomain(source.url).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    {/* Domain name */}
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[180px]">
                      {getDomain(source.url)}
                    </span>
                    
                    <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </a>
                  

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-foreground leading-snug mt-2">
                    {source.title}
                  </h3>
                  
                  {/* Snippet */}
                  {source.snippet && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                      {source.snippet}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};