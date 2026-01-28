import { Download } from "lucide-react";

const files = [
  { name: "Team Review.pdf", size: "1.4MB", color: "bg-pink-100 text-pink-600" },
  { name: "UX Feedback.xls", size: "2.3MB", color: "bg-blue-100 text-blue-600" },
  { name: "UX Review Data.doc", size: "1.7MB", color: "bg-orange-100 text-orange-600" },
];

export const FileAssets = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">File Assets</h4>
        <button className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <Download className="w-3 h-3" />
          Download All
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {files.map((file, i) => (
          <div key={i} className="file-card min-w-[160px]">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${file.color}`}>
              {file.name.split('.').pop()?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
