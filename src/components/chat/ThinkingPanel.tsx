import { useState } from "react";
import { ProcessingStep } from "@/types/workspace";
import { cn } from "@/lib/utils";
import { ChevronRight, Sparkles, Check } from "lucide-react";
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

  return (
    <div className="mb-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Minimal trigger */}
        <CollapsibleTrigger asChild>
          <button className="group flex items-center gap-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight 
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isOpen && "rotate-90"
              )} 
            />
            <div className="flex items-center gap-2">
              {isComplete ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              )}
              <span className="text-sm font-medium">
                {isComplete ? "View reasoning" : activeStep?.label || "Thinking..."}
              </span>
            </div>
            {!isComplete && (
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </button>
        </CollapsibleTrigger>

        {/* Expandable content */}
        <CollapsibleContent>
          <div className="mt-2 ml-5 pl-4 border-l-2 border-muted">
            <div className="space-y-3">
              {/* Completed steps */}
              {completedSteps.map((step, idx) => (
                <div key={step.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-foreground">{step.label}</span>
                  </div>
                  {step.details && step.details.length > 0 && (
                    <ul className="ml-7 space-y-0.5">
                      {step.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="text-[13px] text-muted-foreground leading-relaxed">
                          {detail.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Active step */}
              {activeStep && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {completedSteps.length + 1}
                    </span>
                    <span className="font-medium text-foreground">{activeStep.label}</span>
                  </div>
                  {activeStep.details && activeStep.details.length > 0 && (
                    <ul className="ml-7 space-y-0.5">
                      {activeStep.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="text-[13px] text-muted-foreground leading-relaxed">
                          {detail.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Pending steps preview */}
              {!isComplete && steps.filter(s => s.status === 'pending').slice(0, 2).map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-sm opacity-40">
                  <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center justify-center">
                    {steps.indexOf(step) + 1}
                  </span>
                  <span className="text-muted-foreground">{step.label}</span>
                </div>
              ))}

              {/* Thinking content stream */}
              {thinkingContent && (
                <div className="pt-2 mt-2 border-t border-border">
                  <pre className="text-[13px] text-muted-foreground whitespace-pre-wrap font-sans">
                    {thinkingContent}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
