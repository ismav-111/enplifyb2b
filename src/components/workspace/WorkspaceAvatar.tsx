import { icons } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceIcon } from "@/types/workspace";

interface WorkspaceAvatarProps {
  name: string;
  icon?: WorkspaceIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Default colors based on workspace type or random assignment
const defaultColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getDefaultColor = (name: string): string => {
  // Generate a consistent color based on the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return defaultColors[Math.abs(hash) % defaultColors.length];
};

const sizeClasses = {
  sm: "w-5 h-5 text-[10px]",
  md: "w-6 h-6 text-xs",
  lg: "w-8 h-8 text-sm",
};

const iconSizes = {
  sm: 10,
  md: 12,
  lg: 16,
};

export const WorkspaceAvatar = ({
  name,
  icon,
  size = "sm",
  className,
}: WorkspaceAvatarProps) => {
  const color = icon?.color || getDefaultColor(name);
  const initials = getInitials(name);

  // Render Lucide icon if specified
  if (icon?.type === "lucide" && icon.lucideIcon) {
    const LucideIcon = icons[icon.lucideIcon as keyof typeof icons];
    if (LucideIcon) {
      return (
        <div
          className={cn(
            "flex items-center justify-center rounded-md text-white font-medium shrink-0",
            color,
            sizeClasses[size],
            className
          )}
        >
          <LucideIcon size={iconSizes[size]} />
        </div>
      );
    }
  }

  // Default to letter avatar
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-md text-white font-medium shrink-0",
        color,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

// Available icons for workspace customization
export const availableWorkspaceIcons = [
  "Folder",
  "FolderOpen",
  "Briefcase",
  "Building",
  "Building2",
  "Users",
  "UserCircle",
  "Star",
  "Heart",
  "Zap",
  "Rocket",
  "Target",
  "TrendingUp",
  "BarChart",
  "PieChart",
  "Database",
  "Cloud",
  "Globe",
  "MessageSquare",
  "FileText",
  "BookOpen",
  "Lightbulb",
  "Settings",
  "Shield",
  "Lock",
  "Key",
  "Coffee",
  "Music",
  "Camera",
  "Video",
  "Palette",
  "Layers",
  "Box",
  "Package",
  "ShoppingCart",
  "CreditCard",
  "DollarSign",
  "Percent",
  "Calendar",
  "Clock",
];

export const availableIconColors = [
  { name: "Blue", class: "bg-blue-500" },
  { name: "Emerald", class: "bg-emerald-500" },
  { name: "Purple", class: "bg-purple-500" },
  { name: "Amber", class: "bg-amber-500" },
  { name: "Rose", class: "bg-rose-500" },
  { name: "Cyan", class: "bg-cyan-500" },
  { name: "Indigo", class: "bg-indigo-500" },
  { name: "Teal", class: "bg-teal-500" },
  { name: "Orange", class: "bg-orange-500" },
  { name: "Pink", class: "bg-pink-500" },
  { name: "Lime", class: "bg-lime-500" },
  { name: "Violet", class: "bg-violet-500" },
];
