import { Source, SourceType } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface SourcesListProps {
  sources: Source[];
  onViewSources: (sources: Source[]) => void;
}

// Source type configurations with colors and logos
const sourceTypeConfig: Record<SourceType, { label: string; bgColor: string; logo?: string }> = {
  salesforce: { label: "Salesforce", bgColor: "bg-[#00A1E0]", logo: salesforceLogo },
  zoho: { label: "Zoho", bgColor: "bg-[#E42527]", logo: zohoLogo },
  servicenow: { label: "ServiceNow", bgColor: "bg-[#81B5A1]", logo: servicenowLogo },
  pdf: { label: "PDF", bgColor: "bg-[#E34F26]", logo: pdfLogo },
  powerpoint: { label: "PowerPoint", bgColor: "bg-[#D24726]", logo: powerpointLogo },
  excel: { label: "Excel", bgColor: "bg-[#217346]", logo: excelLogo },
  "google-drive": { label: "Google Drive", bgColor: "bg-white", logo: googleDriveLogo },
  onedrive: { label: "OneDrive", bgColor: "bg-[#0078D4]", logo: onedriveLogo },
  sharepoint: { label: "SharePoint", bgColor: "bg-[#038387]", logo: sharepointLogo },
  snowflake: { label: "Snowflake", bgColor: "bg-[#29B5E8]", logo: snowflakeLogo },
  "sql-database": { label: "SQL Database", bgColor: "bg-[#CC2927]", logo: sqlDatabaseLogo },
  youtube: { label: "YouTube", bgColor: "bg-[#FF0000]", logo: youtubeLogo },
  website: { label: "Website", bgColor: "bg-primary" },
};

// Get icon component based on source type
const SourceIcon = ({ sourceType, className }: { sourceType: SourceType; className?: string }) => {
  const config = sourceTypeConfig[sourceType];
  
  if (config?.logo) {
    return <img src={config.logo} alt={config.label} className={cn("object-contain", className)} />;
  }
  
  return <Globe className={className} />;
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

export const SourcesList = ({ sources, onViewSources }: SourcesListProps) => {
  const displayCount = Math.min(sources.length, 5);
  const displaySources = sources.slice(0, displayCount);
  const hasMore = sources.length > 5;

  return (
    <button 
      onClick={() => onViewSources(sources)}
      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer ml-2"
    >
      {/* Stacked source icons - smaller and tighter */}
      <div className="flex items-center -space-x-1.5">
        {displaySources.map((source, index) => {
          const sourceType = detectSourceType(source.url, source.sourceType);
          const config = sourceTypeConfig[sourceType];
          
          return (
            <TooltipProvider key={index} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-[1.5px] border-background flex items-center justify-center overflow-hidden",
                      "shadow-sm hover:z-10 transition-transform",
                      config.bgColor
                    )}
                    style={{ zIndex: displayCount - index }}
                  >
                    <SourceIcon sourceType={sourceType} className="w-3 h-3" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs font-medium">{config.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{source.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        {hasMore && (
          <div
            className="w-5 h-5 rounded-full border-[1.5px] border-background bg-muted flex items-center justify-center shadow-sm"
            style={{ zIndex: 0 }}
          >
            <span className="text-[8px] font-medium text-muted-foreground">
              +{sources.length - 5}
            </span>
          </div>
        )}
      </div>

      {/* Sources label */}
      <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
        {sources.length} {sources.length === 1 ? 'source' : 'sources'}
      </span>
    </button>
  );
};
