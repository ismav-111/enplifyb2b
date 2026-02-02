import { useState } from "react";
import { WorkspaceGeneralSection } from "./workspace/WorkspaceGeneralSection";
import { WorkspaceUsersSection } from "./workspace/WorkspaceUsersSection";
import { WorkspaceDataSourcesSection } from "./workspace/WorkspaceDataSourcesSection";
import { WorkspaceGuardRailsSection } from "./workspace/WorkspaceGuardRailsSection";
import { WorkspaceDangerZone } from "./workspace/WorkspaceDangerZone";

interface WorkspaceSettingsProps {
  type: "organization" | "my" | "shared";
  subTab: "general" | "members" | "configuration" | "guardrails";
}

const workspaceDefaults = {
  organization: {
    name: "Acme Corp Reports",
    description: "Organization-wide analytics and reporting workspace",
    createdAt: "January 15, 2024",
    createdBy: "John Smith",
  },
  my: {
    name: "Analytics Projects",
    description: "Personal analytics and data exploration",
    createdAt: "March 20, 2024",
    createdBy: "You",
  },
  shared: {
    name: "Marketing Team",
    description: "Shared workspace for marketing analytics",
    createdAt: "February 10, 2024",
    createdBy: "Sarah Connor",
  },
};

export const WorkspaceSettingsSection = ({ type, subTab }: WorkspaceSettingsProps) => {
  const defaults = workspaceDefaults[type];
  const [workspaceName, setWorkspaceName] = useState(defaults.name);
  const [description, setDescription] = useState(defaults.description);

  if (subTab === "general") {
    return (
      <div className="space-y-12">
        <WorkspaceGeneralSection
          workspaceName={workspaceName}
          onNameChange={setWorkspaceName}
          description={description}
          onDescriptionChange={setDescription}
          createdAt={defaults.createdAt}
          createdBy={defaults.createdBy}
        />
        <WorkspaceDangerZone workspaceType={type} />
      </div>
    );
  }

  if (subTab === "members") {
    return (
      <div className="space-y-12">
        <WorkspaceUsersSection />
      </div>
    );
  }

  if (subTab === "configuration") {
    return (
      <div className="space-y-12">
        <WorkspaceDataSourcesSection />
      </div>
    );
  }

  if (subTab === "guardrails") {
    return (
      <div className="space-y-12">
        <WorkspaceGuardRailsSection />
      </div>
    );
  }

  return null;
};
