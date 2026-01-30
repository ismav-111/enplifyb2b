import { useState } from "react";
import { Plus, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Brand logos
import sharepointLogo from "@/assets/logos/sharepoint.svg";
import onedriveLogo from "@/assets/logos/onedrive.svg";
import googleDriveLogo from "@/assets/logos/google-drive.svg";
import salesforceLogo from "@/assets/logos/salesforce.svg";
import zohoLogo from "@/assets/logos/zoho.svg";
import servicenowLogo from "@/assets/logos/servicenow.svg";
import snowflakeLogo from "@/assets/logos/snowflake.svg";
import sqlDatabaseLogo from "@/assets/logos/sql-database.svg";
import youtubeLogo from "@/assets/logos/youtube.svg";
import pdfLogo from "@/assets/logos/pdf.svg";
import powerpointLogo from "@/assets/logos/powerpoint.svg";
import excelLogo from "@/assets/logos/excel.svg";

type DataSourceCategory = "cloud_storage" | "crm_business" | "data_analytics" | "content" | "documents";

interface DataSource {
  id: string;
  name: string;
  category: DataSourceCategory;
  icon: string | null;
  connected: boolean;
  description: string;
}

const categoryLabels: Record<DataSourceCategory, string> = {
  cloud_storage: "Cloud Storage",
  crm_business: "CRM & Business",
  data_analytics: "Data & Analytics",
  content: "Content",
  documents: "Documents",
};

const categoryOrder: DataSourceCategory[] = [
  "cloud_storage",
  "crm_business",
  "data_analytics",
  "content",
  "documents",
];

const initialDataSources: DataSource[] = [
  // Cloud Storage
  { id: "sharepoint", name: "SharePoint", category: "cloud_storage", icon: sharepointLogo, connected: false, description: "Microsoft SharePoint integration" },
  { id: "onedrive", name: "OneDrive", category: "cloud_storage", icon: onedriveLogo, connected: true, description: "Microsoft OneDrive files" },
  { id: "gdrive", name: "Google Drive", category: "cloud_storage", icon: googleDriveLogo, connected: false, description: "Google Drive documents" },
  
  // CRM & Business
  { id: "salesforce", name: "Salesforce", category: "crm_business", icon: salesforceLogo, connected: true, description: "Salesforce CRM data" },
  { id: "zoho", name: "Zoho", category: "crm_business", icon: zohoLogo, connected: false, description: "Zoho CRM integration" },
  { id: "servicenow", name: "ServiceNow", category: "crm_business", icon: servicenowLogo, connected: false, description: "ServiceNow ITSM" },
  
  // Data & Analytics
  { id: "snowflake", name: "Snowflake", category: "data_analytics", icon: snowflakeLogo, connected: false, description: "Snowflake data warehouse" },
  { id: "sql", name: "SQL Database", category: "data_analytics", icon: sqlDatabaseLogo, connected: false, description: "SQL database connection" },
  
  // Content
  { id: "youtube", name: "YouTube", category: "content", icon: youtubeLogo, connected: false, description: "YouTube video content" },
  { id: "website", name: "Website", category: "content", icon: null, connected: true, description: "Web page crawling" },
  
  // Documents
  { id: "pdf", name: "PDF", category: "documents", icon: pdfLogo, connected: true, description: "PDF document upload" },
  { id: "ppt", name: "PowerPoint", category: "documents", icon: powerpointLogo, connected: true, description: "PPT/PPTX files" },
  { id: "excel", name: "Excel", category: "documents", icon: excelLogo, connected: true, description: "Excel spreadsheets" },
];

interface DataSourceCardProps {
  source: DataSource;
  onToggle: (id: string) => void;
}

const DataSourceCard = ({ source, onToggle }: DataSourceCardProps) => (
  <div
    className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-colors",
      source.connected
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-card hover:bg-muted/50"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 flex items-center justify-center">
        {source.icon ? (
          <img 
            src={source.icon} 
            alt={`${source.name} logo`} 
            className="w-5 h-5 object-contain"
          />
        ) : (
          <Globe className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{source.name}</p>
        <p className="text-xs text-muted-foreground">{source.description}</p>
      </div>
    </div>
    <button
      onClick={() => onToggle(source.id)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
        source.connected
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {source.connected ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Connected
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          Connect
        </>
      )}
    </button>
  </div>
);

export const WorkspaceDataSourcesSection = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);

  const handleToggle = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, connected: !ds.connected } : ds
      )
    );
  };

  const groupedSources = categoryOrder.reduce((acc, category) => {
    acc[category] = dataSources.filter((ds) => ds.category === category);
    return acc;
  }, {} as Record<DataSourceCategory, DataSource[]>);

  return (
    <section>
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Data Sources
      </h2>
      
      <div className="space-y-6">
        {categoryOrder.map((category) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-foreground mb-3">
              {categoryLabels[category]}
            </h3>
            <div className="grid gap-2">
              {groupedSources[category].map((source) => (
                <DataSourceCard
                  key={source.id}
                  source={source}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
