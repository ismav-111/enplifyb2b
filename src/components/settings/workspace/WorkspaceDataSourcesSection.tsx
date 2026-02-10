import { useState, useRef, useMemo } from "react";
import { RefreshCw, Globe, Upload, FolderOpen, Eye, ChevronUp, ChevronDown, CloudUpload, Info, FileText, X, Search, SlidersHorizontal, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  configured: boolean; // credentials saved
  connected: boolean;  // actively syncing
  description: string;
  lastSynced?: string;
  stats?: string;
  configFields: ConfigField[];
  savedConfig?: Record<string, string>; // stored config values
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
    configured: false,
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
    configured: true,
    connected: true, 
    description: "Microsoft OneDrive files", 
    lastSynced: "2 hours ago",
    savedConfig: { accountEmail: "user@company.com", accessToken: "••••••" },
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
    configured: true,
    connected: false, 
    description: "Google Drive documents",
    savedConfig: { serviceAccount: "service@project.iam.gserviceaccount.com" },
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
    configured: true,
    connected: true, 
    description: "Salesforce CRM data", 
    lastSynced: "1 hour ago",
    savedConfig: { instanceUrl: "https://mycompany.salesforce.com" },
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
    configured: false,
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
    configured: false,
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
    configured: false,
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
    configured: false,
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
    configured: false,
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
    configured: true,
    connected: true, 
    description: "Web page crawling", 
    lastSynced: "30 minutes ago",
    stats: "156 pages crawled",
    savedConfig: { url: "https://example.com", depth: "2" },
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
  isEditing: boolean;
  onToggleExpand: (id: string) => void;
  onSave: (id: string, config: Record<string, string>) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onSync: (id: string) => void;
  onClear: (id: string) => void;
  onEdit: (id: string) => void;
}

const DataSourceCard = ({ 
  source, 
  isExpanded, 
  isEditing,
  onToggleExpand, 
  onSave,
  onConnect, 
  onDisconnect,
  onSync, 
  onClear,
  onEdit
}: DataSourceCardProps) => {
  const [configValues, setConfigValues] = useState<Record<string, string>>(
    source.savedConfig || {}
  );

  const handleConfigChange = (fieldId: string, value: string) => {
    setConfigValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = () => {
    onSave(source.id, configValues);
  };

  const getStatusText = () => {
    if (source.connected) {
      return source.stats 
        ? `${source.stats} · Last synced ${source.lastSynced}` 
        : `Last synced ${source.lastSynced}`;
    }
    if (source.configured) {
      return source.lastSynced 
        ? `Disconnected · Last synced ${source.lastSynced}` 
        : "Credentials saved · Sync to connect";
    }
    return source.description;
  };

  const getStatusBadge = () => {
    if (source.connected) {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
          <Check className="w-3 h-3" />
          Connected
        </span>
      );
    }
    if (source.configured) {
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
          Saved
        </span>
      );
    }
    return null;
  };

  return (
    <Collapsible open={isExpanded}>
      <div
        className={cn(
          "group rounded-lg border transition-colors",
          source.connected
            ? "border-primary/30 bg-primary/5"
            : source.configured
            ? "border-muted-foreground/30 bg-muted/30"
            : isExpanded
            ? "border-primary/50 bg-card"
            : "border-border bg-card hover:border-border/80"
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
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{source.name}</p>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-muted-foreground">
                {getStatusText()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connected state actions */}
            {source.connected && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(source.id)}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSync(source.id)}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClear(source.id)}
                  className="h-8 px-3 text-xs gap-1.5 text-destructive hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Data
                </Button>
                <div className="w-px h-5 bg-border" />
                <Switch
                  checked={true}
                  onCheckedChange={() => onDisconnect(source.id)}
                />
              </>
            )}

            {/* Configured but not connected */}
            {source.configured && !source.connected && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(source.id)}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSync(source.id)}
                  className="h-8 px-3 text-xs gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClear(source.id)}
                  className="h-8 px-3 text-xs gap-1.5 text-destructive hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear Config
                </Button>
                <div className="w-px h-5 bg-border" />
                <Switch
                  checked={false}
                  onCheckedChange={() => onConnect(source.id)}
                />
              </>
            )}

            {/* Not configured */}
            {!source.configured && !source.connected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleExpand(source.id)}
                className="h-8 px-3 text-xs"
              >
                Configure
              </Button>
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
                      {!isEditing && source.configured ? (
                        <p className="text-sm text-foreground py-1.5 bg-muted/30 px-3 rounded-md">
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

                {/* Action buttons based on state */}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpand(source.id)}
                    className="h-8 px-3 text-xs"
                  >
                    {isEditing ? "Cancel" : "Close"}
                  </Button>
                  
                  {/* Save button when editing */}
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSave}
                      className="h-8 px-4 text-xs"
                    >
                      Save Credentials
                    </Button>
                  )}
                  
                  {/* Save & Sync button for new (unconfigured) sources */}
                  {!source.configured && !source.connected && (
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="h-8 px-4 text-xs"
                    >
                      Save Credentials
                    </Button>
                  )}
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
  extension: string;
  uploadedAt: string;
}

type FileTypeFilter = "all" | "pdf" | "doc" | "image" | "media" | "other";

const fileTypeConfig: Record<FileTypeFilter, { label: string; extensions: string[] }> = {
  all: { label: "All Files", extensions: [] },
  pdf: { label: "PDF", extensions: [".pdf"] },
  doc: { label: "Documents", extensions: [".docx", ".doc", ".txt", ".pptx"] },
  image: { label: "Images", extensions: [".jpg", ".jpeg", ".png", ".webp"] },
  media: { label: "Media", extensions: [".mp3", ".mp4", ".wav"] },
  other: { label: "Other", extensions: [] },
};

const getFileExtension = (filename: string): string => {
  const ext = filename.toLowerCase().match(/\.[^.]+$/);
  return ext ? ext[0] : "";
};

const getFileTypeCategory = (extension: string): FileTypeFilter => {
  for (const [type, config] of Object.entries(fileTypeConfig)) {
    if (type !== "all" && type !== "other" && config.extensions.includes(extension)) {
      return type as FileTypeFilter;
    }
  }
  return "other";
};

const WorkspaceFilesSection = ({ onManageFiles }: WorkspaceFilesSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FileTypeFilter>>(new Set(["all"]));
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
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
    const newFiles: UploadedFile[] = files.map((file, index) => {
      const extension = getFileExtension(file.name);
      return {
        id: `file-${Date.now()}-${index}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        extension,
        uploadedAt: new Date().toLocaleDateString(),
      };
    });
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

  const toggleFilter = (filter: FileTypeFilter) => {
    const newFilters = new Set(activeFilters);
    if (filter === "all") {
      newFilters.clear();
      newFilters.add("all");
    } else {
      newFilters.delete("all");
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
        if (newFilters.size === 0) newFilters.add("all");
      } else {
        newFilters.add(filter);
      }
    }
    setActiveFilters(newFilters);
  };

  const filteredFiles = useMemo(() => {
    return uploadedFiles.filter(file => {
      // Search filter
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Type filter
      if (activeFilters.has("all")) return true;
      const fileCategory = getFileTypeCategory(file.extension);
      return activeFilters.has(fileCategory);
    });
  }, [uploadedFiles, searchQuery, activeFilters]);

  const activeFilterCount = activeFilters.has("all") ? 0 : activeFilters.size;

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const handleDeleteSelected = () => {
    setUploadedFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());
  };

  const isAllSelected = filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length;
  const hasSelection = selectedFiles.size > 0;

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border/50 bg-card shadow-sm">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/30 rounded-t-xl transition-colors"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Workspace Files
            </h3>
            {uploadedFiles.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                {uploadedFiles.length}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">
                  <span className="font-medium">Supported:</span> PDF, DOCX, DOC, TXT, PPTX, JPG, PNG, WEBP, MP3, MP4, WAV
                </p>
                <p className="text-xs mt-1">
                  <span className="font-medium">Max size:</span> 30 MB per file
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-3">
            {/* Compact Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
              className={cn(
                "flex items-center gap-3 p-3 border border-dashed rounded-lg cursor-pointer transition-all",
                isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <CloudUpload className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Drop files or <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Documents, images & media up to 30 MB
                </p>
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

            {/* Search & Filter Bar - Only show when files exist */}
            {uploadedFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs bg-muted/30 border-border/50"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "h-8 px-2.5 text-xs gap-1.5 border-border/50",
                        activeFilterCount > 0 && "border-primary/50 text-primary"
                      )}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {activeFilterCount > 0 && (
                        <span className="text-[10px] font-medium">{activeFilterCount}</span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    {Object.entries(fileTypeConfig).map(([key, config]) => (
                      <DropdownMenuCheckboxItem
                        key={key}
                        checked={activeFilters.has(key as FileTypeFilter)}
                        onCheckedChange={() => toggleFilter(key as FileTypeFilter)}
                        className="text-xs"
                      >
                        {config.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Uploaded Files - Compact List with Multi-select */}
            {filteredFiles.length > 0 && (
              <div className="space-y-1">
                {/* Select All / Bulk Actions Bar */}
                <div className="flex items-center justify-between py-1.5 px-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {hasSelection ? `${selectedFiles.size} selected` : "Select all"}
                    </span>
                  </label>
                  {hasSelection && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteSelected}
                      className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
                
                {/* File List */}
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className={cn(
                      "group flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors cursor-pointer",
                      selectedFiles.has(file.id) && "bg-primary/5"
                    )}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{file.size}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFiles(prev => prev.filter(f => f.id !== file.id));
                        setSelectedFiles(prev => {
                          const next = new Set(prev);
                          next.delete(file.id);
                          return next;
                        });
                      }}
                      className="p-0.5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty/No Results State */}
            {uploadedFiles.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No files uploaded yet
              </p>
            )}
            {uploadedFiles.length > 0 && filteredFiles.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No files match your search
              </p>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export const WorkspaceDataSourcesSection = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [manageSheetOpen, setManageSheetOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedSourceId(prev => prev === id ? null : id);
    setEditingSourceId(null);
  };

  const handleSave = (id: string, config: Record<string, string>) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, configured: true, savedConfig: config } : ds
      )
    );
    setEditingSourceId(null);
    setExpandedSourceId(null);
  };

  const handleConnect = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, configured: true, connected: true, lastSynced: "Just now" } : ds
      )
    );
    setExpandedSourceId(null);
    setEditingSourceId(null);
  };

  const handleDisconnect = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, connected: false } : ds
      )
    );
  };

  const handleSync = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, connected: true, lastSynced: "Just now" } : ds
      )
    );
  };

  const handleClear = (id: string) => {
    setDataSources(
      dataSources.map((ds) =>
        ds.id === id ? { ...ds, stats: undefined } : ds
      )
    );
    console.log("Cleared synced data for:", id);
  };

  const handleEdit = (id: string) => {
    setExpandedSourceId(id);
    setEditingSourceId(id);
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
                      isEditing={editingSourceId === source.id}
                      onToggleExpand={handleToggleExpand}
                      onSave={handleSave}
                      onConnect={handleConnect}
                      onDisconnect={handleDisconnect}
                      onSync={handleSync}
                      onClear={handleClear}
                      onEdit={handleEdit}
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
