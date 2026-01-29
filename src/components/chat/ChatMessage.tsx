import { Message, Source } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { MessageTable } from "./MessageTable";
import { MessageChart } from "./MessageChart";
import { ProcessingIndicator } from "./ProcessingIndicator";
import { SourcesList } from "./SourcesList";
import { Copy, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ChatMessageProps {
  message: Message;
  onViewSources?: (sources: Source[]) => void;
}

export const ChatMessage = ({ message, onViewSources }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    console.log('Edit message:', message.id);
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, 'h:mm a');
  };

  const handleViewSources = (sources: Source[]) => {
    onViewSources?.(sources);
  };

  return (
    <div className={cn(
      "message-fade-in flex mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {/* Message content */}
        <div className={cn(
          "max-w-[80%]",
          isUser && "bg-muted rounded-2xl px-4 py-3"
        )}>
          {/* Processing indicator for assistant messages */}
          {!isUser && message.isProcessing && message.processingSteps && (
            <ProcessingIndicator steps={message.processingSteps} />
          )}

          <div className="text-[15px] leading-relaxed text-foreground">
            {message.type === 'text' && (
              <p className="whitespace-pre-wrap">
                {message.content}
                {message.isStreaming && <span className="streaming-cursor" />}
              </p>
            )}
            
            {message.type === 'table' && message.tableData && (
              <div className="space-y-3">
                {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                <MessageTable data={message.tableData} />
              </div>
            )}
            
            {message.type === 'chart' && message.chartData && (
              <div className="space-y-3">
                {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                <MessageChart data={message.chartData} />
              </div>
            )}
          </div>
          
          {message.isStreaming && !message.content && (
            <div className="streaming-dots">
              <span />
              <span />
              <span />
            </div>
          )}

          {/* Sources section for completed assistant messages */}
          {!isUser && !message.isStreaming && !message.isProcessing && message.sources && message.sources.length > 0 && (
            <SourcesList sources={message.sources} onViewSources={handleViewSources} />
          )}
        </div>

        {/* Action buttons and Timestamp */}
        <div className={cn(
          "flex items-center gap-2",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            <button
              onClick={handleCopy}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
            {isUser && (
              <button
                onClick={handleEdit}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                title="Edit message"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
