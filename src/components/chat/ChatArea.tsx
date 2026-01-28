import { useRef, useEffect } from "react";
import { Message } from "@/types/workspace";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Sparkles } from "lucide-react";

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
  workspaceName,
  sessionName
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-card">
        <div className="flex items-center gap-2 text-sm">
          {workspaceName && (
            <>
              <span className="text-muted-foreground">{workspaceName}</span>
              <span className="text-muted-foreground/50">/</span>
            </>
          )}
          <span className="font-medium text-foreground">{sessionName || "New Chat"}</span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState onSendMessage={onSendMessage} />
        ) : (
          <div className="max-w-4xl mx-auto py-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

const EmptyState = ({ onSendMessage }: { onSendMessage: (msg: string) => void }) => {
  const suggestions = [
    "Show me quarterly sales data as a chart",
    "Create a comparison table of products",
    "Summarize the key performance metrics",
    "Analyze trends in the dataset"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-20">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-xl font-semibold text-foreground mb-2">
        How can I help you today?
      </h1>
      <p className="text-muted-foreground text-sm text-center max-w-md mb-8">
        I can analyze data, create visualizations, generate reports, and provide actionable insights.
      </p>
      
      <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((text, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(text)}
            className="p-4 text-left text-sm rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
