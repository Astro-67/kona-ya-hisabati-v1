import { cn } from "@/lib/utils"

type Size = "sm" | "md" | "lg"

export interface LoadingSpinnerProps {
  size?: Size
  className?: string
  ariaLabel?: string
}

export function LoadingSpinner({
  size = "md",
  className,
  ariaLabel = "Loading",
}: LoadingSpinnerProps) {
  const sizeClass = size === "sm" ? "size-4" : size === "lg" ? "size-8" : "size-6"

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-block animate-spin rounded-full border-[3px] border-primary/60 border-b-transparent",
        sizeClass,
        className
      )}
    />
  )
}