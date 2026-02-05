import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import youtubeLogo from "@/assets/logos/youtube.svg";

interface ModelConfig {
  apiKey: string;
  url: string;
  projectId: string;
}

export const ApiKeysSection = () => {
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "granite">("granite");
  const [graniteConfig, setGraniteConfig] = useState<ModelConfig>({
    apiKey: "",
    url: "",
    projectId: "",
  });
  const [openaiConfig, setOpenaiConfig] = useState<ModelConfig>({
    apiKey: "",
    url: "",
    projectId: "",
  });
  const [youtubeApiKey, setYoutubeApiKey] = useState("sk_youtube_xxxxxxxxxxxxxxxxxxxx");
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);

  const handleSaveModelConfig = () => {
    toast.success("Model configuration saved");
  };

  const handleSaveYoutubeConfig = () => {
    toast.success("YouTube configuration saved");
  };

  const currentConfig = selectedProvider === "granite" ? graniteConfig : openaiConfig;
  const setCurrentConfig = selectedProvider === "granite" ? setGraniteConfig : setOpenaiConfig;
  const providerLabel = selectedProvider === "granite" ? "Granite" : "OpenAI";

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            API Keys
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage API keys for programmatic access to your workspace.
          </p>
        </div>
      </div>

      {/* Model Configuration Card */}
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/30">
          <h3 className="text-sm font-medium text-foreground">Model Provider</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Select and configure your AI model provider</p>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Provider Selection */}
          <RadioGroup
            value={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value as "openai" | "granite")}
            className="flex flex-wrap items-center gap-4"
          >
            <label 
              htmlFor="openai" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                selectedProvider === "openai" 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 hover:border-border hover:bg-muted/30"
              }`}
            >
              <RadioGroupItem value="openai" id="openai" />
              <div>
                <span className="text-sm font-medium text-foreground">OpenAI</span>
                <span className="text-xs text-muted-foreground ml-2">gpt-4.1</span>
              </div>
            </label>
            <label 
              htmlFor="granite" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                selectedProvider === "granite" 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 hover:border-border hover:bg-muted/30"
              }`}
            >
              <RadioGroupItem value="granite" id="granite" />
              <div>
                <span className="text-sm font-medium text-foreground">IBM Granite</span>
                <span className="text-xs text-muted-foreground ml-2">ibm/granite-4-h-small</span>
              </div>
            </label>
          </RadioGroup>

          {/* Dynamic Fields */}
          <div className="grid gap-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="api-key" className="text-xs font-medium">
                {providerLabel} API Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="api-key"
                placeholder={`Enter your ${providerLabel} API key`}
                value={currentConfig.apiKey}
                onChange={(e) => setCurrentConfig({ ...currentConfig, apiKey: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs font-medium">
                {providerLabel} URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                placeholder={`Enter ${providerLabel} URL`}
                value={currentConfig.url}
                onChange={(e) => setCurrentConfig({ ...currentConfig, url: e.target.value })}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-id" className="text-xs font-medium">
                {providerLabel} Project ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-id"
                placeholder={`Enter ${providerLabel} Project ID`}
                value={currentConfig.projectId}
                onChange={(e) => setCurrentConfig({ ...currentConfig, projectId: e.target.value })}
                className="h-9"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveModelConfig} size="sm">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>

      {/* YouTube API Key Card */}
      <div className="border border-border/50 rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border/40 bg-muted/30 flex items-center gap-3">
          <img src={youtubeLogo} alt="YouTube" className="w-5 h-5" />
          <div>
            <h3 className="text-sm font-medium text-foreground">YouTube Integration</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Connect to YouTube Data API</p>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="youtube-key" className="text-xs font-medium">
              API Key <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="youtube-key"
                type={showYoutubeKey ? "text" : "password"}
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
                className="h-9 pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowYoutubeKey(!showYoutubeKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showYoutubeKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveYoutubeConfig} size="sm">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
