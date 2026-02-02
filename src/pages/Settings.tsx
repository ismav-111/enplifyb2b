import { useState } from "react";
import { ArrowLeft, User, Building2, FolderOpen, Users, ChevronDown, ChevronRight, Settings2, Database, Shield, Plus, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountSection } from "@/components/settings/AccountSection";
import { SSOSection } from "@/components/settings/SSOSection";
import { AdministratorsSection } from "@/components/settings/AdministratorsSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { DangerZoneSection } from "@/components/settings/DangerZoneSection";
import { WorkspaceSettingsSection } from "@/components/settings/WorkspaceSettingsSection";
import { WorkspaceListSection } from "@/components/settings/workspace/WorkspaceListSection";
import { CreateWorkspaceDialog } from "@/components/settings/workspace/CreateWorkspaceDialog";
import { EditWorkspaceDialog } from "@/components/settings/workspace/EditWorkspaceDialog";
import { DeleteWorkspaceDialog } from "@/components/settings/workspace/DeleteWorkspaceDialog";
import { WorkspaceContextMenu } from "@/components/settings/workspace/WorkspaceContextMenu";
import { cn } from "@/lib/utils";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import { Workspace } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import enplifyLogo from "@/assets/enplify-logo.png";

type WorkspaceSubTab = "general" | "members" | "configuration" | "guardrails";
type ActiveView = "account" | "workspace-list-personal" | "workspace-list-shared" | "workspace-list-organization" | string;

const subItems = [
  { id: "general" as const, label: "General", icon: Settings2 },
  { id: "members" as const, label: "People", icon: UserCog },
  { id: "configuration" as const, label: "Configuration", icon: Database },
  { id: "guardrails" as const, label: "Guard Rails", icon: Shield },
];

const sectionIcons = {
  personal: FolderOpen,
  shared: Users,
  organization: Building2,
};

const sectionColors = {
  personal: {
    icon: "text-workspace-personal",
    bg: "bg-workspace-personal/10",
    activeBg: "bg-workspace-personal/15",
    activeText: "text-workspace-personal",
  },
  shared: {
    icon: "text-workspace-shared",
    bg: "bg-workspace-shared/10",
    activeBg: "bg-workspace-shared/15",
    activeText: "text-workspace-shared",
  },
  organization: {
    icon: "text-workspace-org",
    bg: "bg-workspace-org/10",
    activeBg: "bg-workspace-org/15",
    activeText: "text-workspace-org",
  },
};

const Settings = () => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(mockWorkspaces);
  const [activeTab, setActiveTab] = useState<ActiveView>("account");
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>("general");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["personal", "shared", "organization"]));
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState<"personal" | "shared" | "organization">("personal");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState<Workspace | null>(null);

  const personalWorkspaces = workspaces.filter(w => w.type === 'personal');
  const sharedWorkspaces = workspaces.filter(w => w.type === 'shared');
  const orgWorkspaces = workspaces.filter(w => w.type === 'organization');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const handleSectionHeaderClick = (sectionKey: "personal" | "shared" | "organization") => {
    setActiveTab(`workspace-list-${sectionKey}`);
    setExpandedWorkspace(null);
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    if (expandedWorkspace === workspaceId) {
      setExpandedWorkspace(null);
    } else {
      setExpandedWorkspace(workspaceId);
      setActiveTab(workspaceId);
      setActiveSubTab("general");
    }
  };

  const handleSubTabClick = (workspaceId: string, subTabId: WorkspaceSubTab) => {
    setActiveTab(workspaceId);
    setActiveSubTab(subTabId);
    setExpandedWorkspace(workspaceId);
  };

  const getActiveWorkspace = () => {
    return workspaces.find(w => w.id === activeTab);
  };

  // CRUD handlers
  const handleOpenCreateDialog = (type: "personal" | "shared" | "organization") => {
    setCreateDialogType(type);
    setCreateDialogOpen(true);
  };

  const handleCreateWorkspace = (data: { name: string; description: string; type: "personal" | "shared" | "organization" }) => {
    const newWorkspace: Workspace = {
      id: `${data.type}-${Date.now()}`,
      name: data.name,
      type: data.type,
      sessions: [],
    };
    setWorkspaces(prev => [...prev, newWorkspace]);
    toast.success(`Workspace "${data.name}" created successfully`);
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setEditDialogOpen(true);
  };

  const handleSaveWorkspace = (workspaceId: string, updates: { name: string; description?: string }) => {
    setWorkspaces(prev => prev.map(w => 
      w.id === workspaceId ? { ...w, name: updates.name } : w
    ));
    toast.success("Workspace updated successfully");
  };

  const handleDeleteWorkspaceClick = (workspace: Workspace) => {
    setDeletingWorkspace(workspace);
    setDeleteDialogOpen(true);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
    if (activeTab === workspaceId) {
      setActiveTab("account");
      setExpandedWorkspace(null);
    }
    toast.success(`Workspace "${workspace?.name}" deleted`);
  };

  const handleOpenWorkspaceSettings = (workspace: Workspace) => {
    setExpandedWorkspace(workspace.id);
    setActiveTab(workspace.id);
    setActiveSubTab("general");
  };

  const renderContent = () => {
    // Account section
    if (activeTab === "account") {
      return (
        <div className="space-y-16">
          <AccountSection />
          <SSOSection />
          <AdministratorsSection />
          <ApiKeysSection />
          <DangerZoneSection />
        </div>
      );
    }

    // Workspace list views
    if (activeTab === "workspace-list-personal") {
      return (
        <WorkspaceListSection
          type="personal"
          workspaces={personalWorkspaces}
          onCreateWorkspace={() => handleOpenCreateDialog("personal")}
          onEditWorkspace={handleEditWorkspace}
          onDeleteWorkspace={handleDeleteWorkspaceClick}
          onOpenWorkspace={handleOpenWorkspaceSettings}
        />
      );
    }

    if (activeTab === "workspace-list-shared") {
      return (
        <WorkspaceListSection
          type="shared"
          workspaces={sharedWorkspaces}
          onCreateWorkspace={() => handleOpenCreateDialog("shared")}
          onEditWorkspace={handleEditWorkspace}
          onDeleteWorkspace={handleDeleteWorkspaceClick}
          onOpenWorkspace={handleOpenWorkspaceSettings}
        />
      );
    }

    if (activeTab === "workspace-list-organization") {
      return (
        <WorkspaceListSection
          type="organization"
          workspaces={orgWorkspaces}
          onCreateWorkspace={() => handleOpenCreateDialog("organization")}
          onEditWorkspace={handleEditWorkspace}
          onDeleteWorkspace={handleDeleteWorkspaceClick}
          onOpenWorkspace={handleOpenWorkspaceSettings}
        />
      );
    }

    // Individual workspace settings
    const workspace = getActiveWorkspace();
    if (!workspace) return null;

    const workspaceType = workspace.type === "organization" ? "organization" : workspace.type === "personal" ? "my" : "shared";
    return <WorkspaceSettingsSection type={workspaceType} subTab={activeSubTab} />;
  };

  const getPageTitle = () => {
    if (activeTab === "account") return "My Account";
    if (activeTab === "workspace-list-personal") return "My Workspaces";
    if (activeTab === "workspace-list-shared") return "Shared Workspaces";
    if (activeTab === "workspace-list-organization") return "Org Workspaces";
    
    const workspace = getActiveWorkspace();
    if (!workspace) return "";
    const subItem = subItems.find(s => s.id === activeSubTab);
    return `${workspace.name} - ${subItem?.label}`;
  };

  const getPageSubtitle = () => {
    if (activeTab === "account") return "Manage your account settings and preferences";
    if (activeTab === "workspace-list-personal") return "Manage your personal workspaces";
    if (activeTab === "workspace-list-shared") return "View workspaces shared with you";
    if (activeTab === "workspace-list-organization") return "Manage organization-wide workspaces";
    
    switch (activeSubTab) {
      case "general":
        return "Manage workspace details and settings";
      case "members":
        return "Manage people and access permissions";
      case "configuration":
        return "Configure data sources and integrations";
      case "guardrails":
        return "Set up safety controls and custom instructions";
      default:
        return "";
    }
  };

  const renderWorkspaceSection = (
    title: string, 
    workspaceList: Workspace[], 
    sectionKey: "personal" | "shared" | "organization",
    showAddButton: boolean = false
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    const isListActive = activeTab === `workspace-list-${sectionKey}`;
    const colors = sectionColors[sectionKey];

    return (
      <div className="mb-1">
        <button
          onClick={() => handleSectionHeaderClick(sectionKey)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group/header",
            isListActive ? colors.activeBg : isExpanded ? colors.bg : "hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2">
            {(() => {
              const Icon = sectionIcons[sectionKey];
              return <Icon className={cn("w-4 h-4", colors.icon)} />;
            })()}
            <h3 className={cn(
              "text-[11px] font-semibold uppercase tracking-wider",
              isExpanded || isListActive ? colors.activeText : "text-muted-foreground"
            )}>
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {showAddButton && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCreateDialog(sectionKey);
                }}
                className="opacity-0 group-hover/header:opacity-100 p-1 hover:bg-accent rounded transition-all"
              >
                <Plus className={cn("w-3.5 h-3.5", colors.icon)} />
              </span>
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(sectionKey);
              }}
              className="p-1 hover:bg-accent rounded transition-all"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-0.5 mt-1">
            {workspaceList.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No workspaces yet
              </p>
            ) : (
              workspaceList.map((workspace) => {
                const isWorkspaceExpanded = expandedWorkspace === workspace.id;
                const isActive = activeTab === workspace.id;

                return (
                  <div key={workspace.id}>
                    <div
                      className={cn(
                        "nav-item w-full justify-between group cursor-pointer",
                        isActive && "bg-accent text-foreground"
                      )}
                      onClick={() => handleWorkspaceClick(workspace.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate text-sm">{workspace.name}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <WorkspaceContextMenu
                          workspace={workspace}
                          onEdit={handleEditWorkspace}
                          onDelete={handleDeleteWorkspaceClick}
                          onOpenSettings={handleOpenWorkspaceSettings}
                        />
                        {isWorkspaceExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isWorkspaceExpanded && (
                      <div className="ml-4 pl-3 border-l border-border space-y-0.5 mt-1">
                        {subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubTabClick(workspace.id, subItem.id)}
                            className={cn(
                              "chat-item w-full justify-start gap-2",
                              isActive && activeSubTab === subItem.id && "chat-item-active"
                            )}
                          >
                            <subItem.icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-sm">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Fixed */}
      <aside className="w-64 border-r border-border h-screen bg-card flex flex-col sticky top-0">
        {/* Logo */}
        <div className="flex items-center px-4 h-14 border-b border-border shrink-0">
          <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
        </div>

        {/* Settings Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* Back to Dashboard */}
          <button
            onClick={() => navigate("/")}
            className="nav-item w-full justify-start gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="truncate text-sm">Back to Dashboard</span>
          </button>

          {/* Separator */}
          <div className="py-2">
            <div className="h-px bg-border/60" />
          </div>

          {/* Account */}
          <button
            onClick={() => {
              setActiveTab("account");
              setExpandedWorkspace(null);
            }}
            className={cn(
              "nav-item w-full justify-start gap-2",
              activeTab === "account" && "bg-accent text-foreground"
            )}
          >
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate text-sm">My Account</span>
          </button>

          {/* Separator */}
          <div className="py-2">
            <div className="h-px bg-border/60" />
          </div>

          {/* Workspace sections */}
          {renderWorkspaceSection("My Workspaces", personalWorkspaces, "personal", true)}
          
          {/* Separator */}
          <div className="py-2">
            <div className="h-px bg-border/60" />
          </div>
          
          {renderWorkspaceSection("Shared Workspaces", sharedWorkspaces, "shared", false)}
          
          {/* Separator */}
          <div className="py-2">
            <div className="h-px bg-border/60" />
          </div>
          
          {renderWorkspaceSection("Org Workspaces", orgWorkspaces, "organization", true)}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl px-8 py-12">
            {/* Page Title */}
            <div className="mb-10">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Settings
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                    {getPageTitle()}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {getPageSubtitle()}
                  </p>
                </div>
                {(activeTab === "workspace-list-personal" || activeTab === "workspace-list-organization") && (
                  <Button 
                    onClick={() => handleOpenCreateDialog(activeTab === "workspace-list-personal" ? "personal" : "organization")} 
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Workspace
                  </Button>
                )}
              </div>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        workspaceType={createDialogType}
        onCreateWorkspace={handleCreateWorkspace}
      />

      <EditWorkspaceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workspace={editingWorkspace}
        onSaveWorkspace={handleSaveWorkspace}
      />

      <DeleteWorkspaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workspace={deletingWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
      />
    </div>
  );
};

export default Settings;
