import { useState, useRef, KeyboardEvent } from "react";
import { Send, Search, Sparkles, Plus, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [activeMode, setActiveMode] = useState<'search' | 'deep'>('search');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Input Field */}
        <div className="flex items-end gap-2 p-3 rounded-xl border border-border bg-background">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask me anything ..."
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-[150px] py-1 text-sm"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex items-center gap-1">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className={cn(
                "p-2 rounded-lg transition-colors",
                message.trim() && !isLoading
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Chips & Upload */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveMode('search')}
              className={cn("chip", activeMode === 'search' && "chip-active")}
            >
              <Search className="w-3 h-3" />
              Search
            </button>
            <button 
              onClick={() => setActiveMode('deep')}
              className={cn("chip", activeMode === 'deep' && "chip-active")}
            >
              <Sparkles className="w-3 h-3" />
              Deep Reason
            </button>
          </div>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
};
