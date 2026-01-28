import { useRef, useEffect } from "react";
import { Message } from "@/types/workspace";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  workspaceName?: string;
  sessionName?: string;
}

export const ChatArea = ({ 
  messages, 
  onSendMessage, 
  isLoading,
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
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
          <div className="border-t border-border bg-background">
            <div className="max-w-3xl mx-auto px-6 py-4">
              <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
            </div>
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
