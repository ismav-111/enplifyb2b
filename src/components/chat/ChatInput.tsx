import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { ArrowUp, Paperclip, X, FileText, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Attachment } from "@/types/workspace";

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Attachment[]) => void;
  isLoading?: boolean;
}

const getFileType = (file: File): Attachment['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.includes('document') || file.type.includes('word')) return 'document';
  if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'spreadsheet';
  return 'other';
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const FileTypeIcon = ({ type }: { type: Attachment['type'] }) => {
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

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      type: getFileType(file),
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const canSend = (message.trim() || attachments.length > 0) && !isLoading;

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md focus-within:shadow-md transition-all">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="px-4 pt-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-lg border border-border/50 group"
              >
                <FileTypeIcon type={attachment.type} />
                <span className="text-sm text-foreground truncate max-w-[120px]">
                  {attachment.name}
                </span>
                {attachment.size && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </span>
                )}
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-0.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

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
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
            />
            <button 
              onClick={handleAttachClick}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Attach file"
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-all",
              canSend
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
