import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountSection } from "@/components/settings/AccountSection";
import { SSOSection } from "@/components/settings/SSOSection";
import { AdministratorsSection } from "@/components/settings/AdministratorsSection";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { DangerZoneSection } from "@/components/settings/DangerZoneSection";
import enplifyLogo from "@/assets/enplify-logo.png";

const Settings = () => {
  const navigate = useNavigate();

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

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            My Account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-16">
          <AccountSection />
          <SSOSection />
          <AdministratorsSection />
          <ApiKeysSection />
          <DangerZoneSection />
        </div>
      </main>
    </div>
  );
};

export default Settings;
