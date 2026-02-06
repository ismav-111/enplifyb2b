import { useState } from "react";
import { Source, SourceType } from "@/types/workspace";
import { X, Globe, ExternalLink } from "lucide-react";
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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedSource = uniqueSources[selectedIndex];
  const selectedSourceType = selectedSource ? detectSourceType(selectedSource.url, selectedSource.sourceType) : 'website';
  const selectedConfig = sourceTypeConfig[selectedSourceType];

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

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Stacked source icons - clickable to switch */}
          <div className="flex items-center gap-2">
            {uniqueSources.map((source, index) => {
              const sourceType = detectSourceType(source.url, source.sourceType);
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center bg-card border transition-all",
                    isSelected 
                      ? "border-primary shadow-sm" 
                      : "border-border/50 hover:border-border opacity-60 hover:opacity-100"
                  )}
                >
                  <SourceIcon sourceType={sourceType} className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Selected source info */}
          {selectedSource && (
            <a
              href={selectedSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all cursor-pointer group"
            >
              {/* Source type & domain */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedConfig.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {getDomain(selectedSource.url)}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                {selectedSource.title}
              </h3>
              
              {/* Snippet */}
              {selectedSource.snippet && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                  {selectedSource.snippet}
                </p>
              )}

              {/* Open link indicator */}
              <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                <ExternalLink className="w-3 h-3" />
                <span>Open source</span>
              </div>
            </a>
          )}

          {/* Source counter */}
          <p className="text-xs text-muted-foreground text-center">
            {selectedIndex + 1} of {uniqueSources.length}
          </p>
        </div>
      </aside>
    </>
  );
};
