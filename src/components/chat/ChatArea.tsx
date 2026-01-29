import { useRef, useEffect } from "react";
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
}

export const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading,
  onViewSources,
  onEditMessage,
  onRegenerateResponse,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
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
