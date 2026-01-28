import { Message } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { MessageTable } from "./MessageTable";
import { MessageChart } from "./MessageChart";
import { Copy, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    // Edit functionality placeholder
    console.log('Edit message:', message.id);
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, 'h:mm a');
  };

  return (
    <div className={cn(
      "message-fade-in flex mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className="flex flex-col gap-1">
        <div className={cn(
          "relative flex items-start gap-2",
          isUser && "flex-row-reverse"
        )}>
          {/* Action buttons */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <button
              onClick={handleCopy}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isUser && (
              <button
                onClick={handleEdit}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                title="Edit message"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Message content */}
          <div className={cn(
            "max-w-[80%]",
            isUser && "bg-muted rounded-2xl px-4 py-3"
          )}>
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
          </div>
        </div>

        {/* Timestamp */}
        <span className={cn(
          "text-xs text-muted-foreground",
          isUser ? "text-right pr-1" : "text-left pl-1"
        )}>
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    </div>
  );
};
