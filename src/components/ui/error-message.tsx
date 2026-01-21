import { AlertTriangle, RefreshCcw } from "lucide-react"

import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface ErrorMessageProps {
  message?: string
  onRetry?: () => void
  className?: string
  retryLabel?: string
}

export function ErrorMessage({
  message = "Something went wrong",
  onRetry,
  className,
  retryLabel = "Retry",
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-md border bg-destructive/5 border-destructive/10 p-4",
        className
      )}
    >
      <div className="size-6 text-destructive">
        <AlertTriangle className="size-6" />
      </div>

      <div className="flex-1">
        <div className="font-semibold leading-none">Error</div>
        <div className="text-muted-foreground text-sm">{message}</div>
      </div>

      {onRetry ? (
        <div className="flex items-center">
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCcw className="size-4" />
            <span className="sr-only">{retryLabel}</span>
            <span className="ml-2">{retryLabel}</span>
          </Button>
        </div>
      ) : null}
    </div>
  )
}