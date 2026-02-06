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

// Source type configurations with colors, icons, and logos
const sourceTypeConfig: Record<SourceType, { label: string; color: string; bgColor: string; logo?: string }> = {
  salesforce: { label: "Salesforce", color: "text-[#00A1E0]", bgColor: "bg-[#00A1E0]", logo: salesforceLogo },
  zoho: { label: "Zoho", color: "text-[#E42527]", bgColor: "bg-[#E42527]", logo: zohoLogo },
  servicenow: { label: "ServiceNow", color: "text-[#81B5A1]", bgColor: "bg-[#81B5A1]", logo: servicenowLogo },
  pdf: { label: "PDF", color: "text-[#E34F26]", bgColor: "bg-[#E34F26]", logo: pdfLogo },
  powerpoint: { label: "PowerPoint", color: "text-[#D24726]", bgColor: "bg-[#D24726]", logo: powerpointLogo },
  excel: { label: "Excel", color: "text-[#217346]", bgColor: "bg-[#217346]", logo: excelLogo },
  "google-drive": { label: "Google Drive", color: "text-[#4285F4]", bgColor: "bg-white border border-border", logo: googleDriveLogo },
  onedrive: { label: "OneDrive", color: "text-[#0078D4]", bgColor: "bg-[#0078D4]", logo: onedriveLogo },
  sharepoint: { label: "SharePoint", color: "text-[#038387]", bgColor: "bg-[#038387]", logo: sharepointLogo },
  snowflake: { label: "Snowflake", color: "text-[#29B5E8]", bgColor: "bg-[#29B5E8]", logo: snowflakeLogo },
  "sql-database": { label: "SQL Database", color: "text-[#CC2927]", bgColor: "bg-[#CC2927]", logo: sqlDatabaseLogo },
  youtube: { label: "YouTube", color: "text-[#FF0000]", bgColor: "bg-[#FF0000]", logo: youtubeLogo },
  website: { label: "Website", color: "text-primary", bgColor: "bg-primary" },
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
                      "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden",
                      config.bgColor
                    )}>
                      <SourceIcon sourceType={sourceType} className="w-4 h-4" />
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
