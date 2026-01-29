import { useState } from "react";
import { ProcessingStep } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ThinkingPanelProps {
  steps: ProcessingStep[];
  thinkingContent?: string;
  isComplete?: boolean;
}

export const ThinkingPanel = ({ steps, thinkingContent, isComplete }: ThinkingPanelProps) => {
  const [isOpen, setIsOpen] = useState(!isComplete);
  
  const activeStep = steps.find(s => s.status === 'active');
  const completedSteps = steps.filter(s => s.status === 'complete');
  const totalSteps = steps.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs font-medium mb-3">
          <Sparkles className={cn("w-3 h-3", !isComplete && "text-primary animate-pulse")} />
          <span>
            {isComplete 
              ? `Reasoning (${completedSteps.length} steps)` 
              : activeStep?.label || "Thinking..."
            }
          </span>
          <ChevronRight 
            className={cn(
              "w-3 h-3 transition-transform duration-200",
              isOpen && "rotate-90"
            )} 
          />
          {!isComplete && (
            <div className="flex items-center gap-0.5 ml-0.5">
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border/50">
          <div className="space-y-2.5">
            {/* Completed steps */}
            {completedSteps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{step.label}</div>
                  {step.details && step.details.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                      {step.details.map((detail, detailIdx) => (
                        <div key={detailIdx}>{detail.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Active step */}
            {activeStep && (
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center mt-0.5 animate-pulse">
                  {completedSteps.length + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{activeStep.label}</div>
                  {activeStep.details && activeStep.details.length > 0 && (
                    <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                      {activeStep.details.map((detail, detailIdx) => (
                        <div key={detailIdx}>{detail.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pending steps */}
            {!isComplete && steps.filter(s => s.status === 'pending').map((step, idx) => (
              <div key={step.id} className="flex items-start gap-2.5 opacity-40">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted-foreground/20 text-muted-foreground text-[10px] font-semibold flex items-center justify-center mt-0.5">
                  {completedSteps.length + (activeStep ? 1 : 0) + idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground">{step.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress indicator */}
          {!isComplete && (
            <div className="mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completedSteps.length}/{totalSteps}</span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
