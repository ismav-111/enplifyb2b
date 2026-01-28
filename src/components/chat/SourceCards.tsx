const sources = [
  { title: "Thinking in Design", desc: "Design recommendations are typically documented" },
  { title: "Talking to UX Talk", desc: "Showcasing UX Review data presented" },
  { title: "Daily Research UX", desc: "Communicated across multiple formats depending on" },
  { title: "Deep UX Thinking", desc: "Insights can be communicated" },
];

export const SourceCards = () => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
      {sources.map((source, i) => (
        <div key={i} className="source-card">
          <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
            {source.title}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {source.desc}
          </p>
        </div>
      ))}
    </div>
  );
};
