import { useState, useRef } from "react";
import { RefreshCw, Trash2, Globe, Upload, FolderOpen, Eye, ChevronUp, ChevronDown, CloudUpload } from "lucide-react";
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
import { DocumentManagementSheet } from "./DocumentManagementSheet";

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
  stats?: string;
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
    stats: "0 videos",
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
    stats: "156 pages crawled",
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
  onView: (id: string) => void;
}

const DataSourceCard = ({ 
  source, 
  isExpanded, 
  onToggleExpand, 
  onConnect, 
  onDisconnect,
  onSync, 
  onClear,
  onView 
}: DataSourceCardProps) => {
  const [configValues, setConfigValues] = useState<Record<string, string>>({});

  const handleConfigChange = (fieldId: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveAndSync = () => {
    onConnect(source.id);
  };

  return (
    <Collapsible open={isExpanded}>
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
                {source.connected 
                  ? (source.stats ? `${source.stats} · Last synced ${source.lastSynced}` : `Last synced ${source.lastSynced}`)
                  : source.description
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {source.connected && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(source.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSync(source.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onClear(source.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-border mx-1" />
              </>
            )}
            <Switch
              checked={source.connected}
              onCheckedChange={() => {
                if (source.connected) {
                  onDisconnect(source.id);
                } else {
                  onToggleExpand(source.id);
                }
              }}
            />
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
                      {source.connected ? (
                        <p className="text-sm text-foreground py-1.5">
                          {field.type === "password" ? "••••••••••••" : configValues[field.id] || "—"}
                        </p>
                      ) : (
                        <Input
                          id={`${source.id}-${field.id}`}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={configValues[field.id] || ""}
                          onChange={(e) => handleConfigChange(field.id, e.target.value)}
                          className="h-9 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {!source.connected && (
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
                )}
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
  <div className="group flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card shadow-sm hover:border-border transition-colors">
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
    
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onManage(doc.id)}
        className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <FolderOpen className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onUpload(doc.id)}
        className="h-8 w-8 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Upload className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

// Workspace Files Section with Drag & Drop
interface WorkspaceFilesSectionProps {
  onManageFiles: (type: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

const WorkspaceFilesSection = ({ onManageFiles }: WorkspaceFilesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      uploadedAt: new Date().toLocaleDateString(),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 rounded-t-xl transition-colors"
      >
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Workspace Files
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-5">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border border-dashed rounded-xl py-10 px-6 text-center transition-all",
              isDragging 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border bg-muted/10 hover:bg-muted/20"
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CloudUpload className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Drag & drop files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or{" "}
                  <button 
                    onClick={handleBrowseClick}
                    className="text-primary hover:underline font-medium"
                  >
                    browse your files
                  </button>
                </p>
              </div>
              <div className="space-y-1 mt-2">
                <p className="text-xs text-muted-foreground">
                  Allowed: Upload documents, images, or media files (PDF, DOCX, DOC, TXT, PPTX, JPG, PNG, WEBP, MP3, MP4, WAV)
                </p>
                <p className="text-xs text-muted-foreground">
                  Max file size: 30 MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.docx,.doc,.txt,.pptx,.jpg,.jpeg,.png,.webp,.mp3,.mp4,.wav"
            />
          </div>

          {/* Uploaded Files Section */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Uploaded Files
            </h4>
            <div className={cn(
              "border border-dashed rounded-xl py-6 px-4 transition-colors",
              "border-border/60 bg-muted/5"
            )}>
              {uploadedFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  No data source files uploaded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div 
                      key={file.id}
                      className="group flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setUploadedFiles(prev => prev.filter(f => f.id !== file.id))}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const WorkspaceDataSourcesSection = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

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

  const handleView = (id: string) => {
    // Toggle expand to show configuration for viewing
    setExpandedSourceId(prev => prev === id ? null : id);
  };

  const handleUpload = (id: string) => {
    console.log("Upload files for:", id);
  };

  const handleManage = (id: string) => {
    const docType = documentTypes.find((d) => d.id === id);
    if (docType) {
      setSelectedDocType(docType);
      setManageSheetOpen(true);
    }
  };

  const groupedSources = categoryOrder.reduce((acc, category) => {
    acc[category] = dataSources.filter((ds) => ds.category === category);
    return acc;
  }, {} as Record<DataSourceCategory, DataSource[]>);

  return (
    <>
      <section className="space-y-8">
        {/* Workspace Files - Top Section */}
        <WorkspaceFilesSection 
          onManageFiles={(type) => {
            const docType = documentTypes.find((d) => d.id === type);
            if (docType) {
              setSelectedDocType(docType);
              setManageSheetOpen(true);
            }
          }}
        />

        {/* Data Source Integrations */}
        <div>
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Integrations
          </h2>
          
          <div className="space-y-6">
            {categoryOrder.map((category) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  {categoryLabels[category]}
                </p>
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
                      onView={handleView}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DocumentManagementSheet
        open={manageSheetOpen}
        onOpenChange={setManageSheetOpen}
        documentType={selectedDocType}
      />
    </>
  );
};
