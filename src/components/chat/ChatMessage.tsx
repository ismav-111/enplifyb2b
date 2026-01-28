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
      "message-fade-in py-6",
      isUser ? "border-b border-border/50" : ""
    )}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {isUser ? 'You' : 'Enplify'}
          </span>
        </div>
        
        <div className="text-[15px] text-foreground leading-relaxed">
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
