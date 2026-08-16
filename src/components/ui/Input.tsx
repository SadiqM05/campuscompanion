import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
