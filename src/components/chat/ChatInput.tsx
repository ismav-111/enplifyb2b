import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
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
    <div className="p-4 pb-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 px-4 py-3 rounded-2xl border border-border bg-card shadow-sm focus-within:border-primary/40 focus-within:shadow-md transition-all">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask anything..."
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-[150px] py-1 text-sm"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={cn(
              "p-2 rounded-xl transition-all",
              message.trim() && !isLoading
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
