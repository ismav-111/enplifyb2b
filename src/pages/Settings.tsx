import { useState } from "react";
import { ArrowLeft, User, Building2, FolderOpen, Users } from "lucide-react";
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

const navItems = [
  { id: "account" as const, label: "My Account", icon: User },
  { id: "organization" as const, label: "Organization Workspace", icon: Building2 },
  { id: "my-workspace" as const, label: "My Workspace", icon: FolderOpen },
  { id: "shared" as const, label: "Shared Workspace", icon: Users },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="space-y-16">
            <AccountSection />
            <SSOSection />
            <AdministratorsSection />
            <ApiKeysSection />
            <DangerZoneSection />
          </div>
        );
      case "organization":
        return <WorkspaceSettingsSection type="organization" />;
      case "my-workspace":
        return <WorkspaceSettingsSection type="my" />;
      case "shared":
        return <WorkspaceSettingsSection type="shared" />;
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item?.label || "Settings";
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case "account":
        return "Manage your account settings and preferences";
      case "organization":
        return "Configure your organization workspace settings";
      case "my-workspace":
        return "Manage your personal workspace settings";
      case "shared":
        return "Configure shared workspace settings and permissions";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="h-14 px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src={enplifyLogo} alt="Enplify.ai" className="h-5" />
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border min-h-[calc(100vh-3.5rem)] bg-card/50">
          <div className="p-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Settings
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    activeTab === item.id
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 max-w-2xl px-12 py-12">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {getPageSubtitle()}
            </p>
          </div>

          {/* Content */}
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Settings;
