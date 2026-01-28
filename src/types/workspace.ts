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

export interface Source {
  title: string;
  url: string;
  snippet?: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'table' | 'chart';
  isStreaming?: boolean;
  isProcessing?: boolean;
  processingSteps?: ProcessingStep[];
  sources?: Source[];
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
