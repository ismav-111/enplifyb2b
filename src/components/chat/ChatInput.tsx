import { useState, useRef, KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Image } from "lucide-react";
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md focus-within:shadow-md transition-all">
        {/* Text area */}
        <div className="px-5 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="What do you want to know?"
            className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/70 min-h-[24px] max-h-[200px] text-base leading-relaxed"
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-1">
            <button 
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Attach image"
            >
              <Image className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all",
              message.trim() && !isLoading
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
