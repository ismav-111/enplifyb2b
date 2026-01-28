import { useRef, useEffect } from "react";
import { Message } from "@/types/workspace";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { MoreHorizontal, Link2, Share2, ChevronDown } from "lucide-react";

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
        <button className="flex items-center gap-2 text-sm font-medium hover:bg-secondary px-3 py-1.5 rounded-lg transition-colors">
          Enplify AI 3.5
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground">
            <Link2 className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary rounded-lg transition-colors text-sm font-medium">
            <Share2 className="w-4 h-4" />
            Share
          </button>
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
    "Summarize the key metrics from last quarter",
    "Analyze trends in the dataset"
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 pb-20">
      <div className="text-center max-w-xl">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          How can I help you today?
        </h1>
        <p className="text-muted-foreground text-sm">
          I can analyze data, create visualizations, generate reports, and provide insights.
        </p>
      </div>
      
      <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((text, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(text)}
            className="p-4 text-left text-sm rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
};
