export type DocumentType = 'pdf' | 'doc' | 'ppt' | 'excel' | 'image' | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number; // in bytes
  uploadedAt: Date;
  workspaceId: string;
  url?: string;
}
