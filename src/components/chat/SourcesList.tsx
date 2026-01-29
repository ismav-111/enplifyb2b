import { Source, SourceType } from "@/types/workspace";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FileText, Presentation, Globe, FileSpreadsheet, FileIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SourcesListProps {
  sources: Source[];
  onViewSources: (sources: Source[]) => void;
}

// Source type configurations with colors
const sourceTypeConfig: Record<SourceType, { label: string; bgColor: string }> = {
  salesforce: { label: "Salesforce", bgColor: "bg-[#00A1E0]" },
  zoho: { label: "Zoho", bgColor: "bg-[#E42527]" },
  servicenow: { label: "ServiceNow", bgColor: "bg-[#81B5A1]" },
  pdf: { label: "PDF", bgColor: "bg-[#E34F26]" },
  ppt: { label: "PowerPoint", bgColor: "bg-[#D24726]" },
  excel: { label: "Excel", bgColor: "bg-[#217346]" },
  doc: { label: "Document", bgColor: "bg-[#2B579A]" },
  website: { label: "Website", bgColor: "bg-primary" },
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

export const SourcesList = ({ sources, onViewSources }: SourcesListProps) => {
  const displayCount = Math.min(sources.length, 5);
  const displaySources = sources.slice(0, displayCount);
  const hasMore = sources.length > 5;

  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <div className="flex items-center gap-2.5">
        {/* Stacked source icons */}
        <button 
          onClick={() => onViewSources(sources)}
          className="flex items-center -space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {displaySources.map((source, index) => {
            const sourceType = detectSourceType(source.url, source.sourceType);
            const config = sourceTypeConfig[sourceType];
            
            return (
              <TooltipProvider key={index} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full border-2 border-background flex items-center justify-center",
                        "shadow-sm hover:z-10 hover:scale-110 transition-transform",
                        config.bgColor
                      )}
                      style={{ zIndex: displayCount - index }}
                    >
                      <SourceIcon sourceType={sourceType} className="w-3.5 h-3.5 text-white" />
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
              className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center shadow-sm"
              style={{ zIndex: 0 }}
            >
              <span className="text-[10px] font-medium text-muted-foreground">
                +{sources.length - 5}
              </span>
            </div>
          )}
        </button>

        {/* Sources label */}
        <button 
          onClick={() => onViewSources(sources)}
          className="text-xs text-muted-foreground font-medium hover:text-foreground transition-colors"
        >
          Sources
        </button>
      </div>
    </div>
  );
};
