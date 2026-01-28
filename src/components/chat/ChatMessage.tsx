import { Message } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { MessageTable } from "./MessageTable";
import { MessageChart } from "./MessageChart";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "message-fade-in flex mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
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
  );
};
