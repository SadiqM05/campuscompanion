import type { FC } from "react";
import { cn } from "../../lib/cn";

export type ProgressStatus = "success" | "warning" | "danger" | "accent";

interface ProgressBarProps {
  percent: number;
  status?: ProgressStatus;
  className?: string;
}

const statusClasses: Record<ProgressStatus, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  accent: "bg-accent",
};

export const ProgressBar: FC<ProgressBarProps> = ({
  percent,
  status = "success",
  className,
}) => {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-border", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-300", statusClasses[status])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
