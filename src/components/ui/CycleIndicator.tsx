import type { FC } from "react";
import { cn } from "../../lib/cn";

interface CycleIndicatorProps {
  total: number;
  completed: number;
}

export const CycleIndicator: FC<CycleIndicatorProps> = ({ total, completed }) => (
  <div className="flex items-center justify-center gap-2">
    {Array.from({ length: total }, (_, index) => (
      <span
        key={index}
        className={cn(
          "h-2.5 w-2.5 rounded-full border transition-colors duration-150",
          index < completed ? "border-accent bg-accent" : "border-border bg-transparent"
        )}
      />
    ))}
  </div>
);
