import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground transition-all duration-200",
          "placeholder:text-muted-foreground",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background",
          "hover:border-muted-foreground/50 hover:bg-secondary/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
