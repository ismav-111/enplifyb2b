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
      "message-fade-in flex gap-4 px-4 py-6",
      isUser ? "bg-transparent" : "bg-muted/30"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        isUser ? "bg-chat-user-bg text-chat-user-fg" : "bg-secondary text-secondary-foreground"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'Enplify.ai'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="text-foreground leading-relaxed">
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
  );
};
