import { useState } from "react";
import { ArrowLeft, User, Building2, FolderOpen, Users, ChevronDown, ChevronRight, Settings2, Database, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountSection } from "@/components/settings/AccountSection";
import { SSOSection } from "@/components/settings/SSOSection";
import { AdministratorsSection } from "@/components/settings/AdministratorsSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { DangerZoneSection } from "@/components/settings/DangerZoneSection";
import { WorkspaceSettingsSection } from "@/components/settings/WorkspaceSettingsSection";
import { cn } from "@/lib/utils";
import { mockWorkspaces } from "@/data/mockWorkspaces";
import enplifyLogo from "@/assets/enplify-logo.png";

type WorkspaceSubTab = "general" | "configuration" | "guardrails";

const subItems = [
  { id: "general" as const, label: "General", icon: Settings2 },
  { id: "configuration" as const, label: "Configuration", icon: Database },
  { id: "guardrails" as const, label: "Guard Rails", icon: Shield },
];

const WorkspaceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'personal': return <FolderOpen className="w-4 h-4" />;
    case 'shared': return <Users className="w-4 h-4" />;
    case 'organization': return <Building2 className="w-4 h-4" />;
    default: return <FolderOpen className="w-4 h-4" />;
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"account" | string>("account");
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>("general");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["personal", "shared", "organization"]));
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);

  const personalWorkspaces = mockWorkspaces.filter(w => w.type === 'personal');
  const sharedWorkspaces = mockWorkspaces.filter(w => w.type === 'shared');
  const orgWorkspaces = mockWorkspaces.filter(w => w.type === 'organization');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
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
    return mockWorkspaces.find(w => w.id === activeTab);
  };

  const renderContent = () => {
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

    const workspace = getActiveWorkspace();
    if (!workspace) return null;

    const workspaceType = workspace.type === "organization" ? "organization" : workspace.type === "personal" ? "my" : "shared";
    return <WorkspaceSettingsSection type={workspaceType} subTab={activeSubTab} />;
  };

  const getPageTitle = () => {
    if (activeTab === "account") return "My Account";
    const workspace = getActiveWorkspace();
    if (!workspace) return "";
    const subItem = subItems.find(s => s.id === activeSubTab);
    return `${workspace.name} - ${subItem?.label}`;
  };

  const getPageSubtitle = () => {
    if (activeTab === "account") return "Manage your account settings and preferences";
    
    switch (activeSubTab) {
      case "general":
        return "Manage workspace details and team members";
      case "configuration":
        return "Configure data sources and integrations";
      case "guardrails":
        return "Set up safety controls and custom instructions";
      default:
        return "";
    }
  };

  const renderWorkspaceSection = (title: string, workspaces: typeof mockWorkspaces, sectionKey: string) => {
    if (workspaces.length === 0) return null;
    const isExpanded = expandedSections.has(sectionKey);

    return (
      <div className="mb-2">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent/50 rounded-lg transition-colors"
        >
          <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-0.5 mt-1">
            {workspaces.map((workspace) => {
              const isWorkspaceExpanded = expandedWorkspace === workspace.id;
              const isActive = activeTab === workspace.id;

              return (
                <div key={workspace.id}>
                  <button
                    onClick={() => handleWorkspaceClick(workspace.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-accent/50 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <WorkspaceIcon type={workspace.type} />
                      <span className="truncate">{workspace.name}</span>
                    </div>
                    {isWorkspaceExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </button>

                  {isWorkspaceExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                      {subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubTabClick(workspace.id, subItem.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors",
                            isActive && activeSubTab === subItem.id
                              ? "bg-accent text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <subItem.icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
        <div className="h-14 px-5 flex items-center border-b border-border shrink-0">
          <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
        </div>

        {/* Back to Dashboard */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Settings Navigation */}
        <div className="px-3 pt-4 flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {/* Account */}
            <button
              onClick={() => {
                setActiveTab("account");
                setExpandedWorkspace(null);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === "account"
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="truncate">My Account</span>
            </button>

            {/* Workspace sections */}
            <div className="pt-4">
              {renderWorkspaceSection("My Workspaces", personalWorkspaces, "personal")}
              {renderWorkspaceSection("Shared Workspaces", sharedWorkspaces, "shared")}
              {renderWorkspaceSection("Organization Workspaces", orgWorkspaces, "organization")}
            </div>
          </nav>
        </div>
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
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {getPageSubtitle()}
              </p>
            </div>

            {/* Content */}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;