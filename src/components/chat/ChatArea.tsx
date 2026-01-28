import { useRef, useEffect } from "react";
import { Message } from "@/types/workspace";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Sparkles, Table, BarChart3, FileText, Zap } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  workspaceName?: string;
  sessionName?: string;
}

const suggestions = [
  { icon: BarChart3, text: "Show me quarterly sales data as a chart", color: "text-blue-500" },
  { icon: Table, text: "Create a comparison table of products", color: "text-emerald-500" },
  { icon: FileText, text: "Summarize the key metrics", color: "text-amber-500" },
  { icon: Zap, text: "Analyze trends in the dataset", color: "text-purple-500" }
];

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
      <header className="flex items-center justify-between px-6 h-16 border-b border-border/60 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {workspaceName && (
            <>
              <span className="text-sm text-muted-foreground font-medium">{workspaceName}</span>
              <span className="text-muted-foreground/40">/</span>
            </>
          )}
          <h1 className="font-semibold text-foreground">
            {sessionName || "New Chat"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full status-online text-xs font-medium">
            <span className="status-dot" />
            Connected
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-20">
            <div className="icon-wrapper-solid w-20 h-20 mb-8 shadow-premium">
              <Sparkles className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
              How can I help you today?
            </h2>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              Ask me anything. I can analyze data, create visualizations, generate reports, and provide actionable insights.
            </p>
            <div className="mt-10 grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-2xl w-full">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSendMessage(suggestion.text)}
                  className="card-interactive group px-5 py-4 text-left flex items-start gap-4"
                >
                  <div className={`icon-wrapper w-10 h-10 flex-shrink-0 ${suggestion.color}`}>
                    <suggestion.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-4">
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
