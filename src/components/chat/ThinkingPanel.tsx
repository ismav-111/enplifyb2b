import { useState } from "react";
import { ProcessingStep } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { ChevronDown, Brain, Check, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ThinkingPanelProps {
  steps: ProcessingStep[];
  thinkingContent?: string;
  isComplete?: boolean;
}

export const ThinkingPanel = ({ steps, thinkingContent, isComplete }: ThinkingPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const activeStep = steps.find(s => s.status === 'active');
  const completedSteps = steps.filter(s => s.status === 'complete');
  const currentLabel = isComplete 
    ? "Thought process" 
    : activeStep?.label || "Thinking...";

  return (
    <div className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] overflow-hidden">
          {/* Header */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-primary/[0.02] transition-colors">
              <ChevronDown 
                className={cn(
                  "w-4 h-4 text-primary transition-transform duration-200",
                  !isOpen && "-rotate-90"
                )} 
              />
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="w-3 h-3 text-primary animate-pulse" />
                  </div>
                )}
                <span className="text-sm font-medium text-primary">
                  {currentLabel}
                </span>
              </div>
              {!isComplete && (
                <Loader2 className="w-3.5 h-3.5 text-primary/60 animate-spin ml-1" />
              )}
            </button>
          </CollapsibleTrigger>

          {/* Content */}
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-1">
              <div className="font-mono text-[13px] leading-relaxed text-foreground/80 space-y-4">
                {/* Show completed steps with their details */}
                {completedSteps.map((step, idx) => (
                  <div key={step.id} className="space-y-2">
                    <div className="font-semibold text-foreground">
                      Step {idx + 1}: {step.label}
                    </div>
                    {step.details && step.details.length > 0 && (
                      <ul className="space-y-1 pl-1">
                        {step.details.map((detail, detailIdx) => (
                          <li key={detailIdx} className="flex items-start gap-2">
                            <span className="text-muted-foreground select-none">-</span>
                            <span>{detail.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {/* Show active step */}
                {activeStep && (
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      Step {completedSteps.length + 1}: {activeStep.label}
                      <span className="inline-flex">
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse ml-0.5" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 h-1 rounded-full bg-primary animate-pulse ml-0.5" style={{ animationDelay: '0.4s' }} />
                      </span>
                    </div>
                    {activeStep.details && activeStep.details.length > 0 && (
                      <ul className="space-y-1 pl-1">
                        {activeStep.details.map((detail, detailIdx) => (
                          <li key={detailIdx} className="flex items-start gap-2">
                            <span className="text-muted-foreground select-none">-</span>
                            <span>{detail.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Thinking content stream */}
                {thinkingContent && (
                  <div className="pt-2 border-t border-primary/10 mt-3">
                    <pre className="whitespace-pre-wrap text-foreground/70">
                      {thinkingContent}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
