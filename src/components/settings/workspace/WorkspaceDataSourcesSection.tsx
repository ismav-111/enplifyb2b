import { useState } from "react";
import { RefreshCw, Trash2, Globe, Upload, FileText, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

interface ConfigField {
  id: string;
  label: string;
  type: "text" | "password" | "url";
  placeholder: string;
}

interface DataSource {
  id: string;
  name: string;
  category: DataSourceCategory;
  icon: string | null;
  connected: boolean;
  description: string;
  lastSynced?: string;
  configFields: ConfigField[];
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
  { 
    id: "sharepoint", 
    name: "SharePoint", 
    category: "cloud_storage", 
    icon: sharepointLogo, 
    connected: false, 
    description: "Microsoft SharePoint integration",
    configFields: [
      { id: "siteUrl", label: "Site URL", type: "url", placeholder: "https://yourcompany.sharepoint.com" },
      { id: "clientId", label: "Client ID", type: "text", placeholder: "Enter client ID" },
      { id: "clientSecret", label: "Client Secret", type: "password", placeholder: "Enter client secret" },
    ]
  },
  { 
    id: "onedrive", 
    name: "OneDrive", 
    category: "cloud_storage", 
    icon: onedriveLogo, 
    connected: true, 
    description: "Microsoft OneDrive files", 
    lastSynced: "2 hours ago",
    configFields: [
      { id: "accountEmail", label: "Account Email", type: "text", placeholder: "user@company.com" },
      { id: "accessToken", label: "Access Token", type: "password", placeholder: "Enter access token" },
    ]
  },
  { 
    id: "gdrive", 
    name: "Google Drive", 
    category: "cloud_storage", 
    icon: googleDriveLogo, 
    connected: false, 
    description: "Google Drive documents",
    configFields: [
      { id: "serviceAccount", label: "Service Account Email", type: "text", placeholder: "service@project.iam.gserviceaccount.com" },
      { id: "privateKey", label: "Private Key", type: "password", placeholder: "Paste private key" },
      { id: "folderId", label: "Folder ID (optional)", type: "text", placeholder: "Enter folder ID to sync" },
    ]
  },
  
  // CRM & Business
  { 
    id: "salesforce", 
    name: "Salesforce", 
    category: "crm_business", 
    icon: salesforceLogo, 
    connected: true, 
    description: "Salesforce CRM data", 
    lastSynced: "1 hour ago",
    configFields: [
      { id: "instanceUrl", label: "Instance URL", type: "url", placeholder: "https://yourcompany.salesforce.com" },
      { id: "username", label: "Username", type: "text", placeholder: "Enter username" },
      { id: "securityToken", label: "Security Token", type: "password", placeholder: "Enter security token" },
    ]
  },
  { 
    id: "zoho", 
    name: "Zoho", 
    category: "crm_business", 
    icon: zohoLogo, 
    connected: false, 
    description: "Zoho CRM integration",
    configFields: [
      { id: "clientId", label: "Client ID", type: "text", placeholder: "Enter client ID" },
      { id: "clientSecret", label: "Client Secret", type: "password", placeholder: "Enter client secret" },
      { id: "refreshToken", label: "Refresh Token", type: "password", placeholder: "Enter refresh token" },
    ]
  },
  { 
    id: "servicenow", 
    name: "ServiceNow", 
    category: "crm_business", 
    icon: servicenowLogo, 
    connected: false, 
    description: "ServiceNow ITSM",
    configFields: [
      { id: "instanceUrl", label: "Instance URL", type: "url", placeholder: "https://yourcompany.service-now.com" },
      { id: "username", label: "Username", type: "text", placeholder: "Enter username" },
      { id: "password", label: "Password", type: "password", placeholder: "Enter password" },
    ]
  },
  
  // Data & Analytics
  { 
    id: "snowflake", 
    name: "Snowflake", 
    category: "data_analytics", 
    icon: snowflakeLogo, 
    connected: false, 
    description: "Snowflake data warehouse",
    configFields: [
      { id: "account", label: "Account Identifier", type: "text", placeholder: "xy12345.us-east-1" },
      { id: "warehouse", label: "Warehouse", type: "text", placeholder: "COMPUTE_WH" },
      { id: "database", label: "Database", type: "text", placeholder: "Enter database name" },
      { id: "username", label: "Username", type: "text", placeholder: "Enter username" },
      { id: "password", label: "Password", type: "password", placeholder: "Enter password" },
    ]
  },
  { 
    id: "sql", 
    name: "SQL Database", 
    category: "data_analytics", 
    icon: sqlDatabaseLogo, 
    connected: false, 
    description: "SQL database connection",
    configFields: [
      { id: "host", label: "Host", type: "text", placeholder: "localhost or IP address" },
      { id: "port", label: "Port", type: "text", placeholder: "5432" },
      { id: "database", label: "Database Name", type: "text", placeholder: "Enter database name" },
      { id: "username", label: "Username", type: "text", placeholder: "Enter username" },
      { id: "password", label: "Password", type: "password", placeholder: "Enter password" },
    ]
  },
  
  // Content
  { 
    id: "youtube", 
    name: "YouTube", 
    category: "content", 
    icon: youtubeLogo, 
    connected: false, 
    description: "YouTube video content",
    configFields: [
      { id: "apiKey", label: "API Key", type: "password", placeholder: "Enter YouTube API key" },
      { id: "channelId", label: "Channel ID (optional)", type: "text", placeholder: "Enter channel ID" },
      { id: "playlistId", label: "Playlist ID (optional)", type: "text", placeholder: "Enter playlist ID" },
    ]
  },
  { 
    id: "website", 
    name: "Website", 
    category: "content", 
    icon: null, 
    connected: true, 
    description: "Web page crawling", 
    lastSynced: "30 minutes ago",
    configFields: [
      { id: "url", label: "Website URL", type: "url", placeholder: "https://example.com" },
      { id: "depth", label: "Crawl Depth", type: "text", placeholder: "2" },
      { id: "includePatterns", label: "Include Patterns (optional)", type: "text", placeholder: "/docs/*, /blog/*" },
    ]
  },
];

const initialDocumentTypes: DocumentType[] = [
  { id: "pdf", name: "PDF", icon: pdfLogo, description: "PDF documents", enabled: true, fileCount: 24 },
  { id: "ppt", name: "PowerPoint", icon: powerpointLogo, description: "Presentations", enabled: true, fileCount: 12 },
  { id: "excel", name: "Excel", icon: excelLogo, description: "Spreadsheets", enabled: true, fileCount: 8 },
];

interface DataSourceCardProps {
  source: DataSource;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSync: (id: string) => void;
  onClear: (id: string) => void;
}

const DataSourceCard = ({ 
  source, 
  isExpanded, 
  onToggleExpand, 
  onConnect, 
  onDisconnect,
  onSync, 
  onClear 
}: DataSourceCardProps) => {
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const handleConfigChange = (fieldId: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveAndSync = () => {
    onConnect(source.id);
  };

  return (
    <Collapsible open={isExpanded && !source.connected}>
      <div
        className={cn(
          "rounded-lg border transition-colors",
          source.connected
            ? "border-primary/30 bg-primary/5"
            : isExpanded
            ? "border-primary/50 bg-card"
            : "border-border bg-card"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
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
            {source.connected ? (
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Connected</span>
                  <Switch
                    checked={source.connected}
                    onCheckedChange={() => onDisconnect(source.id)}
                  />
                </div>
              </>
            ) : (
              <CollapsibleTrigger asChild>
                <Button
                  variant={isExpanded ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleExpand(source.id)}
                  className="h-8 px-3 text-xs"
                >
                  Connect
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 ml-1.5 transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
            )}
          </div>
        </div>

        {/* Expandable Configuration */}
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-border pt-4">
              <div className="space-y-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Connection Settings
                </p>
                
                <div className="grid gap-3">
                  {source.configFields.map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <Label htmlFor={`${source.id}-${field.id}`} className="text-xs">
                        {field.label}
                      </Label>
                      <Input
                        id={`${source.id}-${field.id}`}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={configValues[field.id] || ""}
                        onChange={(e) => handleConfigChange(field.id, e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpand(source.id)}
                    className="h-8 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveAndSync}
                    className="h-8 px-4 text-xs"
                  >
                    Save & Sync
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

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
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedSourceId(prev => prev === id ? null : id);
  };

  const handleConnect = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, connected: true, lastSynced: "Just now" } : ds
      )
    );
    setExpandedSourceId(null);
  };

  const handleDisconnect = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, connected: false, lastSynced: undefined } : ds
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
    console.log("Clear data for:", id);
  };

  const handleUpload = (id: string) => {
    console.log("Upload files for:", id);
  };

  const handleManage = (id: string) => {
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
                    isExpanded={expandedSourceId === source.id}
                    onToggleExpand={handleToggleExpand}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
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
