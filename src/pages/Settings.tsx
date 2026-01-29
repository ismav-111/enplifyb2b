import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountSection } from "@/components/settings/AccountSection";
import { SSOSection } from "@/components/settings/SSOSection";
import { AdministratorsSection } from "@/components/settings/AdministratorsSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { DangerZoneSection } from "@/components/settings/DangerZoneSection";
import { cn } from "@/lib/utils";

type SettingsTab = "account" | "sso" | "team" | "api" | "danger";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "sso", label: "SSO Configuration" },
  { id: "team", label: "Administrators" },
  { id: "api", label: "API Keys" },
  { id: "danger", label: "Danger Zone" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <nav className="w-48 shrink-0">
            <ul className="space-y-1">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                      activeTab === tab.id
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === "account" && <AccountSection />}
            {activeTab === "sso" && <SSOSection />}
            {activeTab === "team" && <AdministratorsSection />}
            {activeTab === "api" && <ApiKeysSection />}
            {activeTab === "danger" && <DangerZoneSection />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
