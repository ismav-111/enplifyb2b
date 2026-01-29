import { Source, SourceType } from "@/types/workspace";
import { X, FileText, Presentation, Globe, FileSpreadsheet, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourcesSidebarProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

// Source type configurations with colors and icons
const sourceTypeConfig: Record<SourceType, { label: string; color: string; bgColor: string }> = {
  salesforce: { label: "Salesforce", color: "text-[#00A1E0]", bgColor: "bg-[#00A1E0]" },
  zoho: { label: "Zoho", color: "text-[#E42527]", bgColor: "bg-[#E42527]" },
  servicenow: { label: "ServiceNow", color: "text-[#81B5A1]", bgColor: "bg-[#81B5A1]" },
  pdf: { label: "PDF", color: "text-[#E34F26]", bgColor: "bg-[#E34F26]" },
  ppt: { label: "PowerPoint", color: "text-[#D24726]", bgColor: "bg-[#D24726]" },
  excel: { label: "Excel", color: "text-[#217346]", bgColor: "bg-[#217346]" },
  doc: { label: "Document", color: "text-[#2B579A]", bgColor: "bg-[#2B579A]" },
  website: { label: "Website", color: "text-primary", bgColor: "bg-primary" },
};

// Get icon component based on source type
const SourceIcon = ({ sourceType, className }: { sourceType: SourceType; className?: string }) => {
  switch (sourceType) {
    case 'salesforce':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M10.006 5.415a4.195 4.195 0 0 1 3.045-1.306c1.56 0 2.954.9 3.69 2.205.63-.3 1.35-.45 2.1-.45 2.85 0 5.159 2.34 5.159 5.22s-2.31 5.22-5.16 5.22c-.45 0-.884-.06-1.305-.165a3.844 3.844 0 0 1-3.405 2.085c-.6 0-1.17-.135-1.68-.39a4.807 4.807 0 0 1-4.32 2.7c-2.235 0-4.126-1.545-4.71-3.645a4.138 4.138 0 0 1-.795.075C1.17 16.964 0 15.514 0 13.714c0-1.11.54-2.085 1.38-2.67a4.428 4.428 0 0 1-.345-1.71C1.035 6.754 3.24 4.54 5.97 4.54c1.2 0 2.295.42 3.165 1.125l-.129-.25Z"/>
        </svg>
      );
    case 'zoho':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 7.5h15v2h-15zM4.5 11h15v2h-15zM4.5 14.5h10v2h-10z"/>
        </svg>
      );
    case 'servicenow':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      );
    case 'pdf':
      return <FileText className={className} />;
    case 'ppt':
      return <Presentation className={className} />;
    case 'excel':
      return <FileSpreadsheet className={className} />;
    case 'doc':
      return <FileIcon className={className} />;
    case 'website':
    default:
      return <Globe className={className} />;
  }
};

// Extract domain from URL
const getDomain = (url: string) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "source";
  }
};

// Detect source type from URL if not provided
const detectSourceType = (url: string, providedType?: SourceType): SourceType => {
  if (providedType) return providedType;
  
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('salesforce')) return 'salesforce';
  if (lowerUrl.includes('zoho')) return 'zoho';
  if (lowerUrl.includes('servicenow')) return 'servicenow';
  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('/pdf')) return 'pdf';
  if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx') || lowerUrl.includes('/slides')) return 'ppt';
  if (lowerUrl.endsWith('.xls') || lowerUrl.endsWith('.xlsx')) return 'excel';
  if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'doc';
  return 'website';
};

export const SourcesSidebar = ({ sources, isOpen, onClose }: SourcesSidebarProps) => {
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
              const sourceType = detectSourceType(source.url, source.sourceType);
              const config = sourceTypeConfig[sourceType];
              
              return (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all duration-200 cursor-pointer group"
                >
                  {/* Source Icon + Label */}
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                      config.bgColor
                    )}>
                      <SourceIcon sourceType={sourceType} className="w-4 h-4 text-white" />
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className={cn("text-xs font-semibold", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {getDomain(source.url)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-sm font-medium text-foreground leading-snug mt-3 group-hover:text-primary transition-colors">
                    {source.title}
                  </h3>
                  
                  {/* Snippet */}
                  {source.snippet && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                      {source.snippet}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};