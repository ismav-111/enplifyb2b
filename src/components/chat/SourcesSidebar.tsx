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

// Source type configurations with colors, icons, and logos
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
          "fixed right-0 top-0 h-full w-96 bg-background border-l border-border z-50",
          "transform transition-transform duration-300 ease-in-out",
          "lg:relative lg:z-0",
          isOpen ? "translate-x-0" : "translate-x-full lg:hidden"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Sources ({uniqueSources.length})</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Stack on left, Details on right */}
        <div className="flex h-[calc(100%-57px)]">
          {/* Source Stack - Left Side */}
          <div className="w-16 border-r border-border bg-muted/30 py-3 overflow-y-auto">
            <div className="flex flex-col items-center gap-2">
              {uniqueSources.map((source, index) => {
                const sourceType = detectSourceType(source.url, source.sourceType);
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
                      "border-2 bg-card shadow-sm",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/20 scale-105" 
                        : "border-transparent hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <SourceIcon sourceType={sourceType} className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Details - Right Side */}
          <div className="flex-1 overflow-y-auto p-5">
            {selectedSource && (
              <div className="space-y-5">
                {/* Source Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <SourceIcon sourceType={selectedSourceType} className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      {selectedConfig.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {getDomain(selectedSource.url)}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border" />

                {/* Title */}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Document Title
                  </p>
                  <h4 className="text-sm font-medium text-foreground leading-relaxed">
                    {selectedSource.title}
                  </h4>
                </div>

                {/* Snippet */}
                {selectedSource.snippet && (
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                      Content Preview
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedSource.snippet}
                    </p>
                  </div>
                )}

                {/* URL */}
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    Source URL
                  </p>
                  <a
                    href={selectedSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <span className="truncate max-w-[220px]">{selectedSource.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                </div>

                {/* Open Button */}
                <a
                  href={selectedSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Source
                </a>

                {/* Source Index */}
                <p className="text-center text-xs text-muted-foreground">
                  Source {selectedIndex + 1} of {uniqueSources.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
