import { useRef, useEffect } from "react";
import { FileText, Settings, User, LogOut } from "lucide-react";
import { Message, Source } from "@/types/workspace";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Fixed Header Bar - matches sidebar style */}
      <header className="h-14 flex items-center justify-end px-4 border-b border-border shrink-0">
        {/* Documents Icon with Badge */}
        <button
          onClick={onOpenDocuments}
          className="p-2 rounded-lg hover:bg-accent transition-colors group mr-2"
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
        
        {/* User Profile Avatar with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2">
              JD
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-50">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">john@company.com</p>
            </div>
            <DropdownMenuItem 
              onClick={() => handleNavigation("/settings?tab=account")}
              className="gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              My Account
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleNavigation("/settings")}
              className="gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

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
        <h1 className="text-2xl font-semibold text-foreground mb-6 text-center">
          Hi Mahesh, Let's get your work done
        </h1>
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
