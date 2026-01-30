import { useState } from "react";
import { RefreshCw, Trash2, Globe, Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

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

type DataSourceCategory = "cloud_storage" | "crm_business" | "data_analytics" | "content";

interface DataSource {
  id: string;
  name: string;
  category: DataSourceCategory;
  icon: string | null;
  connected: boolean;
  description: string;
  lastSynced?: string;
}

interface DocumentType {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
  fileCount: number;
}

const categoryLabels: Record<DataSourceCategory, string> = {
  cloud_storage: "Cloud Storage",
  crm_business: "CRM & Business",
  data_analytics: "Data & Analytics",
  content: "Content",
};

const categoryOrder: DataSourceCategory[] = [
  "cloud_storage",
  "crm_business",
  "data_analytics",
  "content",
];

const initialDataSources: DataSource[] = [
  // Cloud Storage
  { id: "sharepoint", name: "SharePoint", category: "cloud_storage", icon: sharepointLogo, connected: false, description: "Microsoft SharePoint integration" },
  { id: "onedrive", name: "OneDrive", category: "cloud_storage", icon: onedriveLogo, connected: true, description: "Microsoft OneDrive files", lastSynced: "2 hours ago" },
  { id: "gdrive", name: "Google Drive", category: "cloud_storage", icon: googleDriveLogo, connected: false, description: "Google Drive documents" },
  
  // CRM & Business
  { id: "salesforce", name: "Salesforce", category: "crm_business", icon: salesforceLogo, connected: true, description: "Salesforce CRM data", lastSynced: "1 hour ago" },
  { id: "zoho", name: "Zoho", category: "crm_business", icon: zohoLogo, connected: false, description: "Zoho CRM integration" },
  { id: "servicenow", name: "ServiceNow", category: "crm_business", icon: servicenowLogo, connected: false, description: "ServiceNow ITSM" },
  
  // Data & Analytics
  { id: "snowflake", name: "Snowflake", category: "data_analytics", icon: snowflakeLogo, connected: false, description: "Snowflake data warehouse" },
  { id: "sql", name: "SQL Database", category: "data_analytics", icon: sqlDatabaseLogo, connected: false, description: "SQL database connection" },
  
  // Content
  { id: "youtube", name: "YouTube", category: "content", icon: youtubeLogo, connected: false, description: "YouTube video content" },
  { id: "website", name: "Website", category: "content", icon: null, connected: true, description: "Web page crawling", lastSynced: "30 minutes ago" },
];

const initialDocumentTypes: DocumentType[] = [
  { id: "pdf", name: "PDF", icon: pdfLogo, description: "PDF documents", enabled: true, fileCount: 24 },
  { id: "ppt", name: "PowerPoint", icon: powerpointLogo, description: "Presentations", enabled: true, fileCount: 12 },
  { id: "excel", name: "Excel", icon: excelLogo, description: "Spreadsheets", enabled: true, fileCount: 8 },
];

interface DataSourceCardProps {
  source: DataSource;
  onToggle: (id: string) => void;
  onSync: (id: string) => void;
  onClear: (id: string) => void;
}

const DataSourceCard = ({ source, onToggle, onSync, onClear }: DataSourceCardProps) => (
  <div
    className={cn(
      "flex items-center justify-between p-4 rounded-lg border transition-colors",
      source.connected
        ? "border-primary/30 bg-primary/5"
        : "border-border bg-card"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50">
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
        <p className="text-xs text-muted-foreground">
          {source.connected && source.lastSynced 
            ? `Last synced ${source.lastSynced}` 
            : source.description
          }
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      {source.connected && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSync(source.id)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Sync
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClear(source.id)}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Clear
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
        </>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {source.connected ? "Connected" : "Disconnected"}
        </span>
        <Switch
          checked={source.connected}
          onCheckedChange={() => onToggle(source.id)}
        />
      </div>
    </div>
  </div>
);

interface DocumentTypeCardProps {
  doc: DocumentType;
  onUpload: (id: string) => void;
  onManage: (id: string) => void;
}

const DocumentTypeCard = ({ doc, onUpload, onManage }: DocumentTypeCardProps) => (
  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted/50">
        <img 
          src={doc.icon} 
          alt={`${doc.name} icon`} 
          className="w-5 h-5 object-contain"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{doc.name}</p>
        <p className="text-xs text-muted-foreground">
          {doc.fileCount} {doc.fileCount === 1 ? 'file' : 'files'} uploaded
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onManage(doc.id)}
        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
      >
        <FileText className="w-3.5 h-3.5 mr-1.5" />
        Manage
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUpload(doc.id)}
        className="h-8 px-3 text-xs"
      >
        <Upload className="w-3.5 h-3.5 mr-1.5" />
        Upload
      </Button>
    </div>
  </div>
);

export const WorkspaceDataSourcesSection = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);

  const handleToggle = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, connected: !ds.connected, lastSynced: !ds.connected ? "Just now" : undefined } : ds
      )
    );
  };

  const handleSync = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, lastSynced: "Just now" } : ds
      )
    );
  };

  const handleClear = (id: string) => {
    // In real implementation, this would clear the synced data
    console.log("Clear data for:", id);
  };

  const handleUpload = (id: string) => {
    // In real implementation, this would open file upload dialog
    console.log("Upload files for:", id);
  };

  const handleManage = (id: string) => {
    // In real implementation, this would open document management
    console.log("Manage files for:", id);
  };

  const groupedSources = categoryOrder.reduce((acc, category) => {
    acc[category] = dataSources.filter((ds) => ds.category === category);
    return acc;
  }, {} as Record<DataSourceCategory, DataSource[]>);

  return (
    <section className="space-y-8">
      {/* Data Source Integrations */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Data Source Integrations
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
                    onSync={handleSync}
                    onClear={handleClear}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Uploads */}
      <div>
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Document Uploads
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Upload and manage documents directly. Supported formats include PDF, PowerPoint, and Excel files.
        </p>
        
        <div className="grid gap-2">
          {documentTypes.map((doc) => (
            <DocumentTypeCard
              key={doc.id}
              doc={doc}
              onUpload={handleUpload}
              onManage={handleManage}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
