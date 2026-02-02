import { useRef, useEffect } from "react";
import { FileText } from "lucide-react";
import { Message, Source } from "@/types/workspace";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  workspaceName?: string;
  sessionName?: string;
  onViewSources?: (sources: Source[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
  onOpenDocuments?: () => void;
  documentCount?: number;
}

export const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onViewSources,
  onEditMessage,
  onRegenerateResponse,
  onOpenDocuments,
  documentCount = 0,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Documents Icon with Badge */}
      <button
        onClick={onOpenDocuments}
        className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-accent transition-colors group"
      >
        <div className="relative">
          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          {documentCount > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1">
              {documentCount}
            </span>
          )}
        </div>
      </button>

      {messages.length === 0 ? (
        <EmptyState onSendMessage={onSendMessage} isLoading={isLoading} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-6">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onViewSources={onViewSources}
                  onEditMessage={onEditMessage}
                  onRegenerateResponse={onRegenerateResponse}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto w-full px-6 pb-6">
            <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
          </div>
        </>
      )}
    </div>
  );
};

const EmptyState = ({ onSendMessage, isLoading }: { onSendMessage: (msg: string) => void; isLoading: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="w-full max-w-2xl">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
