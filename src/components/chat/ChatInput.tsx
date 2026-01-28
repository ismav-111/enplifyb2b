import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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
    <div className="border-t border-border/40 bg-gradient-to-t from-background via-background to-transparent p-4 pb-6">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "input-premium flex items-end gap-2 p-2 bg-card border",
          isFocused ? "border-primary/30" : "border-border/60"
        )}>
          <button 
            className="p-2.5 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask Enplify.ai anything..."
            className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 min-h-[28px] max-h-[200px] py-2.5 px-1 text-[15px]"
            rows={1}
            disabled={isLoading}
          />
          
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-200",
              message.trim() && !isLoading
                ? "btn-primary-glow text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <p className="text-[11px] text-muted-foreground/60 text-center mt-3 tracking-wide">
          Enplify.ai may produce inaccurate information. Verify critical data.
        </p>
      </div>
    </div>
  );
};
