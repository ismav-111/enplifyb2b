import { FileText, Presentation, Sheet, Image, File } from "lucide-react";
import { DocumentType } from "@/types/document";
import { cn } from "@/lib/utils";

interface DocumentIconProps {
  type: DocumentType;
  className?: string;
}

const iconConfig: Record<DocumentType, { icon: typeof FileText; bgColor: string; iconColor: string }> = {
  pdf: { icon: FileText, bgColor: "bg-red-500/10", iconColor: "text-red-500" },
  doc: { icon: FileText, bgColor: "bg-blue-500/10", iconColor: "text-blue-500" },
  ppt: { icon: Presentation, bgColor: "bg-orange-500/10", iconColor: "text-orange-500" },
  excel: { icon: Sheet, bgColor: "bg-green-500/10", iconColor: "text-green-500" },
  image: { icon: Image, bgColor: "bg-purple-500/10", iconColor: "text-purple-500" },
  other: { icon: File, bgColor: "bg-muted", iconColor: "text-muted-foreground" },
};

export const DocumentIcon = ({ type, className }: DocumentIconProps) => {
  const config = iconConfig[type] || iconConfig.other;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center justify-center rounded-lg", config.bgColor, className)}>
      <Icon className={cn("w-5 h-5", config.iconColor)} />
    </div>
  );
};
