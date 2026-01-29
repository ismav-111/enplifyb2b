import { useState } from "react";
import { WorkspaceGeneralSection } from "./workspace/WorkspaceGeneralSection";
import { WorkspaceUsersSection } from "./workspace/WorkspaceUsersSection";
import { WorkspaceDataSourcesSection } from "./workspace/WorkspaceDataSourcesSection";
import { WorkspaceGuardRailsSection } from "./workspace/WorkspaceGuardRailsSection";
import { WorkspaceDangerZone } from "./workspace/WorkspaceDangerZone";

interface WorkspaceSettingsProps {
  type: "organization" | "my" | "shared";
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

export const WorkspaceSettingsSection = ({ type }: WorkspaceSettingsProps) => {
  const defaults = workspaceDefaults[type];
  const [workspaceName, setWorkspaceName] = useState(defaults.name);
  const [description, setDescription] = useState(defaults.description);

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

      <WorkspaceUsersSection />

      <WorkspaceDataSourcesSection />

      <WorkspaceGuardRailsSection />

      <WorkspaceDangerZone workspaceType={type} />
    </div>
  );
};
