import * as React from "react"

import { cn } from "@/lib/utils"

type TabsContextValue = {
  value: string
  setValue: (next: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? ""
  )
  const value = controlledValue ?? uncontrolledValue

  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next)
      }
      onValueChange?.(next)
    },
    [controlledValue, onValueChange]
  )

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col gap-2", className)} {...props} />
    </TabsContext.Provider>
  )
}

function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  value,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs")
  }

  const isActive = context.value === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => context.setValue(value)}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error("TabsContent must be used within Tabs")
  }

  if (context.value !== value) {
    return null
  }

  return (
    <div
      role="tabpanel"
      className={cn("mt-2", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
