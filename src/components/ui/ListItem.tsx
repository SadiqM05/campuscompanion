import type { FC, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const ListItem: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-surface-hover",
      className
    )}
    {...props}
  />
);
