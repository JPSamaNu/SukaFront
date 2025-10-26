import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses = {
      default: "bg-[color:var(--btn-bg)] text-[color:var(--btn-fg)] shadow-smsoft hover:opacity-95",
      secondary: "bg-[color:var(--surface-2)] text-[color:var(--text)] hover:bg-[color:var(--surface-2)]/80",
      outline: "border border-[color:var(--card-border)] bg-[color:var(--surface)] text-[color:var(--text)] hover:bg-[color:var(--surface-2)]",
      ghost: "text-[color:var(--text)] hover:bg-[color:var(--surface-2)]"
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base"
    }
    
    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }