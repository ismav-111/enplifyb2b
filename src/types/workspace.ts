export interface ChatSession {
  id: string;
  name: string;
  createdAt: Date;
  lastMessage?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'shared' | 'organization';
  sessions: ChatSession[];
}

export type SourceType = 'website' | 'pdf' | 'ppt' | 'salesforce' | 'zoho' | 'servicenow' | 'excel' | 'doc';

export interface Source {
  title: string;
  url: string;
  snippet?: string;
  sourceType?: SourceType;
}

export interface ProcessingStepDetail {
  text: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
  details?: ProcessingStepDetail[];
}

export interface ThinkingState {
  isThinking: boolean;
  steps: ProcessingStep[];
  thinkingContent?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'spreadsheet' | 'other';
  size?: number;
  url?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'table' | 'chart';
  isStreaming?: boolean;
  isProcessing?: boolean;
  processingSteps?: ProcessingStep[];
  thinkingContent?: string;
  sources?: Source[];
  attachments?: Attachment[];
  timestamp: Date;
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  chartData?: {
    labels: string[];
    values: number[];
    type: 'bar' | 'line' | 'pie';
  };
}
