import { Message, Source, Attachment } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { MessageTable } from "./MessageTable";
import { MessageChart } from "./MessageChart";
import { ThinkingPanel } from "./ThinkingPanel";
import { SourcesList } from "./SourcesList";
import { Copy, Pencil, Check, RefreshCw, X, FileText, Image, File } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: Message;
  onViewSources?: (sources: Source[]) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateResponse?: (messageId: string) => void;
}

const AttachmentIcon = ({ type }: { type: Attachment['type'] }) => {
  switch (type) {
    case 'image':
      return <Image className="w-4 h-4" />;
    case 'pdf':
    case 'document':
      return <FileText className="w-4 h-4" />;
    default:
      return <File className="w-4 h-4" />;
  }
};

const AttachmentPreview = ({ attachments }: { attachments: Attachment[] }) => {
  if (!attachments || attachments.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg border border-border/50"
        >
          <AttachmentIcon type={attachment.type} />
          <span className="text-sm text-foreground truncate max-w-[150px]">
            {attachment.name}
          </span>
          {attachment.size && (
            <span className="text-xs text-muted-foreground">
              {formatFileSize(attachment.size)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const ChatMessage = ({ message, onViewSources, onEditMessage, onRegenerateResponse }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEditMessage?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleRegenerate = () => {
    onRegenerateResponse?.(message.id);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return format(timestamp, 'h:mm a');
  };

  const handleViewSources = (sources: Source[]) => {
    onViewSources?.(sources);
  };

  return (
    <div className={cn(
      "message-fade-in flex mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
        {/* Message content */}
        <div className={cn(
          "max-w-[80%]",
          isUser && !isEditing && "bg-muted rounded-2xl px-4 py-3"
        )}>
          {/* Thinking panel for assistant messages - show during and after processing */}
          {!isUser && message.processingSteps && message.processingSteps.length > 0 && (
            <ThinkingPanel 
              steps={message.processingSteps} 
              thinkingContent={message.thinkingContent}
              isComplete={!message.isProcessing}
            />
          )}

          {/* Edit mode for user messages */}
          {isUser && isEditing ? (
            <div className="flex flex-col gap-2 min-w-[300px]">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 text-[15px] leading-relaxed bg-muted rounded-2xl border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none min-h-[48px]"
                rows={1}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 px-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="h-8 px-3"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-[15px] leading-relaxed text-foreground">
              {/* Show attachments for user messages */}
              {isUser && message.attachments && message.attachments.length > 0 && (
                <AttachmentPreview attachments={message.attachments} />
              )}
              
              {message.type === 'text' && (
                <p className="whitespace-pre-wrap">
                  {message.content}
                  {message.isStreaming && <span className="streaming-cursor" />}
                </p>
              )}
              
              {message.type === 'table' && message.tableData && (
                <div className="space-y-3">
                  {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                  <MessageTable data={message.tableData} />
                </div>
              )}
              
              {message.type === 'chart' && message.chartData && (
                <div className="space-y-3">
                  {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
                  <MessageChart data={message.chartData} />
                </div>
              )}
            </div>
          )}
          
          {message.isStreaming && !message.content && (
            <div className="streaming-dots">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {/* Footer row - only show when not editing */}
        {!isEditing && (
          <div className={cn(
            "flex items-center gap-3",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            {isUser ? (
              // User message footer: timestamp, then actions
              <>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    title="Copy message"
                  >
                    {copied ? <Check className="w-[18px] h-[18px]" /> : <Copy className="w-[18px] h-[18px]" />}
                  </button>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                    title="Edit message"
                  >
                    <Pencil className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </>
            ) : (
              // System message footer: sources → actions → timestamp (always visible)
              <>
                {!message.isStreaming && !message.isProcessing && message.sources && message.sources.length > 0 && (
                  <SourcesList sources={message.sources} onViewSources={handleViewSources} />
                )}
                {!message.isStreaming && !message.isProcessing && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleCopy}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      title="Copy message"
                    >
                      {copied ? <Check className="w-[18px] h-[18px]" /> : <Copy className="w-[18px] h-[18px]" />}
                    </button>
                    <button
                      onClick={handleRegenerate}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                      title="Regenerate response"
                    >
                      <RefreshCw className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
