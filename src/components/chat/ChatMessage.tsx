import { Message } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { MessageTable } from "./MessageTable";
import { MessageChart } from "./MessageChart";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "message-fade-in flex gap-4 px-6 py-5",
      !isUser && "bg-muted/30"
    )}>
      <div className={cn(
        "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm",
        isUser 
          ? "bg-gradient-to-br from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))] text-white" 
          : "bg-card border border-border/60 text-foreground"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm text-foreground">
            {isUser ? 'You' : 'Enplify.ai'}
          </span>
          <span className="text-[11px] text-muted-foreground/60 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="text-foreground/90 leading-relaxed text-[15px]">
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && <span className="streaming-cursor" />}
            </p>
          )}
          
          {message.type === 'table' && message.tableData && (
            <div className="space-y-4">
              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
              <MessageTable data={message.tableData} />
            </div>
          )}
          
          {message.type === 'chart' && message.chartData && (
            <div className="space-y-4">
              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
              <MessageChart data={message.chartData} />
            </div>
          )}
        </div>
        
        {message.isStreaming && !message.content && (
          <div className="streaming-dots py-1">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
};
