import type { FC, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Badge: FC<HTMLAttributes<HTMLSpanElement>> = ({ className, ...props }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
);
