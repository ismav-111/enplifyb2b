import { useState, useRef, useEffect } from "react";
import { Source, SourceType } from "@/types/workspace";
import { X, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Import actual brand logos
import salesforceLogo from "@/assets/logos/salesforce.svg";
import zohoLogo from "@/assets/logos/zoho.svg";
import servicenowLogo from "@/assets/logos/servicenow.svg";
import pdfLogo from "@/assets/logos/pdf.svg";
import powerpointLogo from "@/assets/logos/powerpoint.svg";
import excelLogo from "@/assets/logos/excel.svg";
import googleDriveLogo from "@/assets/logos/google-drive.svg";
import onedriveLogo from "@/assets/logos/onedrive.svg";
import sharepointLogo from "@/assets/logos/sharepoint.svg";
import snowflakeLogo from "@/assets/logos/snowflake.svg";
import sqlDatabaseLogo from "@/assets/logos/sql-database.svg";
import youtubeLogo from "@/assets/logos/youtube.svg";

interface SourcesSidebarProps {
  sources: Source[];
  isOpen: boolean;
  onClose: () => void;
}

// Source type configurations
const sourceTypeConfig: Record<SourceType, { label: string; logo?: string }> = {
  salesforce: { label: "Salesforce", logo: salesforceLogo },
  zoho: { label: "Zoho", logo: zohoLogo },
  servicenow: { label: "ServiceNow", logo: servicenowLogo },
  pdf: { label: "PDF", logo: pdfLogo },
  powerpoint: { label: "PowerPoint", logo: powerpointLogo },
  excel: { label: "Excel", logo: excelLogo },
  "google-drive": { label: "Google Drive", logo: googleDriveLogo },
  onedrive: { label: "OneDrive", logo: onedriveLogo },
  sharepoint: { label: "SharePoint", logo: sharepointLogo },
  snowflake: { label: "Snowflake", logo: snowflakeLogo },
  "sql-database": { label: "SQL Database", logo: sqlDatabaseLogo },
  youtube: { label: "YouTube", logo: youtubeLogo },
  website: { label: "Website" },
};

// Get icon component based on source type
const SourceIcon = ({ sourceType, className }: { sourceType: SourceType; className?: string }) => {
  const config = sourceTypeConfig[sourceType];
  
  if (config?.logo) {
    return <img src={config.logo} alt={config.label} className={cn("object-contain", className)} />;
  }
  
  return <Globe className={className} />;
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
  if (lowerUrl.includes('drive.google')) return 'google-drive';
  if (lowerUrl.includes('onedrive') || lowerUrl.includes('1drv')) return 'onedrive';
  if (lowerUrl.includes('sharepoint')) return 'sharepoint';
  if (lowerUrl.includes('snowflake')) return 'snowflake';
  if (lowerUrl.includes('youtube') || lowerUrl.includes('youtu.be')) return 'youtube';
  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('/pdf')) return 'pdf';
  if (lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx') || lowerUrl.includes('/slides')) return 'powerpoint';
  if (lowerUrl.endsWith('.xls') || lowerUrl.endsWith('.xlsx')) return 'excel';
  return 'website';
};

export const SourcesSidebar = ({ sources, isOpen, onClose }: SourcesSidebarProps) => {
  // Deduplicate sources by URL
  const uniqueSources = sources.filter((source, index, self) => 
    index === self.findIndex(s => s.url === source.url)
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const sourceRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Scroll to selected source
  useEffect(() => {
    if (selectedIndex !== null && sourceRefs.current[selectedIndex]) {
      sourceRefs.current[selectedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIndex]);

  const handleStackClick = (index: number) => {
    setSelectedIndex(index);
  };

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
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">Sources</h2>
            {/* Stacked icons */}
            <div className="flex items-center -space-x-1">
              {uniqueSources.map((source, index) => {
                const sourceType = detectSourceType(source.url, source.sourceType);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => handleStackClick(index)}
                    className={cn(
                      "w-6 h-6 rounded-md border-2 border-background flex items-center justify-center bg-card shadow-sm transition-all",
                      isSelected && "ring-2 ring-primary ring-offset-1"
                    )}
                    style={{ zIndex: uniqueSources.length - index }}
                  >
                    <SourceIcon sourceType={sourceType} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
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
              const isSelected = index === selectedIndex;
              
              return (
                <a
                  key={index}
                  ref={el => sourceRefs.current[index] = el}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "block p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all duration-200 cursor-pointer group",
                    isSelected ? "border-primary ring-1 ring-primary/20" : "border-border/50 hover:border-border"
                  )}
                >
                  {/* Source Icon + Label */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-muted/50 border border-border/50">
                      <SourceIcon sourceType={sourceType} className="w-4 h-4" />
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-foreground">
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
