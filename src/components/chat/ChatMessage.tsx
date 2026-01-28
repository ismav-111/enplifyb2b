import { Message } from "@/types/workspace";
import { MessageTable } from "./MessageTable";
import { MessageChart } from "./MessageChart";
import { SourceCards } from "./SourceCards";
import { FileAssets } from "./FileAssets";
import { Layers, Sparkles, ExternalLink } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="message-fade-in px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground leading-relaxed">
          {message.content}
        </h2>
      </div>
    );
  }

  return (
    <div className="message-fade-in px-6 py-4 space-y-6">
      {/* Resources & Sources Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="chip chip-active">
            <Layers className="w-3 h-3" />
            25 Resources
          </button>
          <button className="chip">
            <Sparkles className="w-3 h-3" />
            Deep Reason
          </button>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          View All Sources
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Source Cards */}
      <SourceCards />

      {/* Main Content */}
      <div className="space-y-4">
        {message.type === 'text' && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Summary</h3>
            <div className="text-sm text-foreground/80 leading-relaxed space-y-3">
              <p className="whitespace-pre-wrap">
                {message.content}
                {message.isStreaming && <span className="streaming-cursor" />}
              </p>
            </div>
          </div>
        )}
        
        {message.type === 'table' && message.tableData && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Summary</h3>
            {message.content && (
              <p className="text-sm text-foreground/80 leading-relaxed">{message.content}</p>
            )}
            <MessageTable data={message.tableData} />
          </div>
        )}
        
        {message.type === 'chart' && message.chartData && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Summary</h3>
            {message.content && (
              <p className="text-sm text-foreground/80 leading-relaxed">{message.content}</p>
            )}
            <MessageChart data={message.chartData} />
          </div>
        )}
      </div>

      {/* File Assets */}
      <FileAssets />
      
      {message.isStreaming && !message.content && (
        <div className="streaming-dots py-1">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
};
