import type { FC, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow duration-150 hover:shadow-md",
      className
    )}
    {...props}
  />
);
