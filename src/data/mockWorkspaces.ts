import { Workspace } from "@/types/workspace";

export const mockWorkspaces: Workspace[] = [
  {
    id: "personal-1",
    name: "Analytics Projects",
    type: "personal",
    icon: { type: "lucide", lucideIcon: "BarChart", color: "bg-blue-500" },
    sessions: [
      { id: "session-1", name: "Q4 Revenue Analysis", createdAt: new Date(), lastMessage: "Show me the trends..." },
      { id: "session-2", name: "Customer Segmentation", createdAt: new Date(), lastMessage: "Create a table..." },
      { id: "session-3", name: "Market Research", createdAt: new Date(), lastMessage: "Compare competitors..." }
    ]
  },
  {
    id: "personal-2",
    name: "Data Exploration",
    type: "personal",
    sessions: [
      { id: "session-4", name: "Dataset Overview", createdAt: new Date() }
    ]
  },
  {
    id: "shared-1",
    name: "Marketing Team",
    type: "shared",
    icon: { type: "lucide", lucideIcon: "Target", color: "bg-teal-500" },
    sessions: [
      { id: "session-5", name: "Campaign Performance", createdAt: new Date() },
      { id: "session-6", name: "Social Media Metrics", createdAt: new Date() }
    ]
  },
  {
    id: "shared-2",
    name: "Sales Analysis",
    type: "shared",
    sessions: [
      { id: "session-7", name: "Pipeline Review", createdAt: new Date() }
    ]
  },
  {
    id: "org-1",
    name: "Acme Corp Reports",
    type: "organization",
    icon: { type: "lucide", lucideIcon: "Building2", color: "bg-purple-500" },
    sessions: [
      { id: "session-8", name: "Monthly KPIs", createdAt: new Date() },
      { id: "session-9", name: "Board Presentation", createdAt: new Date() },
      { id: "session-10", name: "Annual Review 2024", createdAt: new Date() }
    ]
  }
];
