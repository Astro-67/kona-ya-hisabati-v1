import * as React from "react"
import { Box } from "lucide-react"

import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "No items",
  description,
  actionLabel = "Create",
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-8 text-center", className)}>
      <div className="size-10 text-muted-foreground">
        {icon ?? <Box className="size-10 opacity-60" />}
      </div>

      <div className="font-semibold">{title}</div>

      {description ? <div className="text-muted-foreground text-sm">{description}</div> : null}

      {onAction ? (
        <Button className="mt-2" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}