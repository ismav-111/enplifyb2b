import { useState } from "react";
import { ArrowLeft, User, Building2, FolderOpen, Users, ChevronDown, Settings2, Database, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountSection } from "@/components/settings/AccountSection";
import { SSOSection } from "@/components/settings/SSOSection";
import { AdministratorsSection } from "@/components/settings/AdministratorsSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { DangerZoneSection } from "@/components/settings/DangerZoneSection";
import { WorkspaceSettingsSection } from "@/components/settings/WorkspaceSettingsSection";
import { cn } from "@/lib/utils";
import enplifyLogo from "@/assets/enplify-logo.png";

type SettingsTab = "account" | "organization" | "my-workspace" | "shared";
type WorkspaceSubTab = "general" | "configuration" | "guardrails";

interface WorkspaceNavItem {
  id: SettingsTab;
  label: string;
  icon: typeof Building2;
  subItems: { id: WorkspaceSubTab; label: string; icon: typeof Settings2 }[];
}

const accountNav = { id: "account" as const, label: "My Account", icon: User };

const workspaceNavItems: WorkspaceNavItem[] = [
  {
    id: "organization",
    label: "Organization Workspace",
    icon: Building2,
    subItems: [
      { id: "general", label: "General", icon: Settings2 },
      { id: "configuration", label: "Configuration", icon: Database },
      { id: "guardrails", label: "Guard Rails", icon: Shield },
    ],
  },
  {
    id: "my-workspace",
    label: "My Workspace",
    icon: FolderOpen,
    subItems: [
      { id: "general", label: "General", icon: Settings2 },
      { id: "configuration", label: "Configuration", icon: Database },
      { id: "guardrails", label: "Guard Rails", icon: Shield },
    ],
  },
  {
    id: "shared",
    label: "Shared Workspace",
    icon: Users,
    subItems: [
      { id: "general", label: "General", icon: Settings2 },
      { id: "configuration", label: "Configuration", icon: Database },
      { id: "guardrails", label: "Guard Rails", icon: Shield },
    ],
  },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>("general");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<SettingsTab[]>(["organization"]);

  const toggleWorkspaceExpand = (id: SettingsTab) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleWorkspaceClick = (workspaceId: SettingsTab) => {
    if (activeTab !== workspaceId) {
      setActiveTab(workspaceId);
      setActiveSubTab("general");
    }
    if (!expandedWorkspaces.includes(workspaceId)) {
      setExpandedWorkspaces((prev) => [...prev, workspaceId]);
    }
  };

  const handleSubTabClick = (workspaceId: SettingsTab, subTabId: WorkspaceSubTab) => {
    setActiveTab(workspaceId);
    setActiveSubTab(subTabId);
    if (!expandedWorkspaces.includes(workspaceId)) {
      setExpandedWorkspaces((prev) => [...prev, workspaceId]);
    }
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

    const workspaceType = activeTab === "organization" ? "organization" : activeTab === "my-workspace" ? "my" : "shared";
    return <WorkspaceSettingsSection type={workspaceType} subTab={activeSubTab} />;
  };

  const getPageTitle = () => {
    if (activeTab === "account") return "My Account";
    const workspace = workspaceNavItems.find((w) => w.id === activeTab);
    const subItem = workspace?.subItems.find((s) => s.id === activeSubTab);
    return `${workspace?.label} - ${subItem?.label}`;
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
              onClick={() => setActiveTab("account")}
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
              <p className="px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Workspaces
              </p>
              {workspaceNavItems.map((workspace) => {
                const isExpanded = expandedWorkspaces.includes(workspace.id);
                const isActive = activeTab === workspace.id;

                return (
                  <div key={workspace.id} className="mb-1">
                    <button
                      onClick={() => {
                        toggleWorkspaceExpand(workspace.id);
                        handleWorkspaceClick(workspace.id);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-accent/50 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <workspace.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{workspace.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                        {workspace.subItems.map((subItem) => (
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
