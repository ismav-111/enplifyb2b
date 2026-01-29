import { Document } from "@/types/document";

export const mockDocuments: Document[] = [
  {
    id: "doc-1",
    name: "Q4 Financial Report 2024.pdf",
    type: "pdf",
    size: 2457600, // 2.4 MB
    uploadedAt: new Date("2024-01-15T10:30:00"),
    workspaceId: "personal-1",
  },
  {
    id: "doc-2",
    name: "Product Roadmap.ppt",
    type: "ppt",
    size: 5242880, // 5 MB
    uploadedAt: new Date("2024-01-14T14:20:00"),
    workspaceId: "personal-1",
  },
  {
    id: "doc-3",
    name: "Customer Analysis.xlsx",
    type: "excel",
    size: 1048576, // 1 MB
    uploadedAt: new Date("2024-01-13T09:15:00"),
    workspaceId: "shared-1",
  },
  {
    id: "doc-4",
    name: "Marketing Strategy 2024.doc",
    type: "doc",
    size: 524288, // 512 KB
    uploadedAt: new Date("2024-01-12T16:45:00"),
    workspaceId: "shared-1",
  },
  {
    id: "doc-5",
    name: "Team Photo.png",
    type: "image",
    size: 3145728, // 3 MB
    uploadedAt: new Date("2024-01-11T11:00:00"),
    workspaceId: "org-1",
  },
  {
    id: "doc-6",
    name: "Sales Report Q3.pdf",
    type: "pdf",
    size: 1572864, // 1.5 MB
    uploadedAt: new Date("2024-01-10T08:30:00"),
    workspaceId: "personal-1",
  },
  {
    id: "doc-7",
    name: "Training Materials.ppt",
    type: "ppt",
    size: 8388608, // 8 MB
    uploadedAt: new Date("2024-01-09T13:00:00"),
    workspaceId: "org-1",
  },
  {
    id: "doc-8",
    name: "Budget Forecast.xlsx",
    type: "excel",
    size: 786432, // 768 KB
    uploadedAt: new Date("2024-01-08T15:30:00"),
    workspaceId: "shared-1",
  },
];
