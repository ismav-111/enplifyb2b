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

// Source type configurations with logos
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
      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer ml-2"
    >
      {/* Stacked source icons */}
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
                      "w-6 h-6 rounded-md border-2 border-background flex items-center justify-center overflow-hidden",
                      "shadow-sm hover:z-10 transition-transform bg-card"
                    )}
                    style={{ zIndex: displayCount - index }}
                  >
                    <SourceIcon sourceType={sourceType} className="w-4 h-4" />
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
            className="w-6 h-6 rounded-md border-2 border-background bg-muted flex items-center justify-center shadow-sm"
            style={{ zIndex: 0 }}
          >
            <span className="text-[9px] font-semibold text-muted-foreground">
              +{sources.length - 5}
            </span>
          </div>
        )}
      </div>

      {/* Sources label */}
      <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        {sources.length} {sources.length === 1 ? 'source' : 'sources'}
      </span>
    </button>
  );
};
