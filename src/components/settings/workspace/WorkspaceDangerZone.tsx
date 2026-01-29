interface WorkspaceDangerZoneProps {
  workspaceType: "organization" | "my" | "shared";
}

export const WorkspaceDangerZone = ({ workspaceType }: WorkspaceDangerZoneProps) => {
  return (
    <section>
      <h2 className="text-xs font-medium text-destructive uppercase tracking-wider mb-4">
        Danger Zone
      </h2>
      <div className="border border-destructive/30 rounded-lg bg-destructive/5">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Delete Workspace</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete this workspace and all its data. This action cannot be undone.
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
