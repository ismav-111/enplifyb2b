import { ProcessingStep } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { Check, Loader2, Circle } from "lucide-react";

interface ProcessingIndicatorProps {
  steps: ProcessingStep[];
}

export const ProcessingIndicator = ({ steps }: ProcessingIndicatorProps) => {
  return (
    <div className="flex flex-col gap-2 py-2">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-2 text-sm">
          {step.status === 'complete' && (
            <Check className="w-4 h-4 text-primary" />
          )}
          {step.status === 'active' && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          {step.status === 'pending' && (
            <Circle className="w-4 h-4 text-muted-foreground/50" />
          )}
          <span className={cn(
            "transition-colors",
            step.status === 'complete' && "text-foreground",
            step.status === 'active' && "text-foreground",
            step.status === 'pending' && "text-muted-foreground/50"
          )}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
