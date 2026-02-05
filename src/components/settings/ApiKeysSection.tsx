import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

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
    <section className="space-y-8">
      {/* Model Configuration */}
      <div className="grid grid-cols-[200px_1fr] gap-8">
        <div>
          <h2 className="text-sm font-semibold text-foreground">API Keys</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage API keys for programmatic access to your workspace.
          </p>
        </div>

        <div className="space-y-6">
          {/* Provider Selection */}
          <RadioGroup
            value={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value as "openai" | "granite")}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="text-sm font-medium cursor-pointer">
                OpenAI gpt-4.1
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="granite" id="granite" />
              <Label htmlFor="granite" className="text-sm font-medium cursor-pointer">
                IBM Granite ibm/granite-4-h-small
              </Label>
            </div>
          </RadioGroup>

          {/* Dynamic Fields based on provider */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm">
                {providerLabel} API Key <span className="text-destructive">*</span>
              </Label>
              <Input
                id="api-key"
                placeholder={`Enter your ${providerLabel} API key`}
                value={currentConfig.apiKey}
                onChange={(e) => setCurrentConfig({ ...currentConfig, apiKey: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm">
                {providerLabel} URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="url"
                placeholder={`Enter ${providerLabel} URL`}
                value={currentConfig.url}
                onChange={(e) => setCurrentConfig({ ...currentConfig, url: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-id" className="text-sm">
                {providerLabel} Project ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-id"
                placeholder={`Enter ${providerLabel} Project ID`}
                value={currentConfig.projectId}
                onChange={(e) => setCurrentConfig({ ...currentConfig, projectId: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveModelConfig}>
                Save Model Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* YouTube API Key */}
      <div className="grid grid-cols-[200px_1fr] gap-8">
        <div />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-key" className="text-sm">
              YouTube API Key <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="youtube-key"
                type={showYoutubeKey ? "text" : "password"}
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
                className="h-10 pr-10"
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

          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveYoutubeConfig}>
              Save YouTube Configuration
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
