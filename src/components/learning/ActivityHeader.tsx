"use client"

import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export interface ActivityHeaderProps {
  title: string
  subtitle?: string
  childName?: string
  progress?: number
  onBack?: () => void
}

export function ActivityHeader({
  title,
  subtitle,
  childName,
  progress = 0,
  onBack,
}: ActivityHeaderProps) {
  const initials = (name?: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const safeProgress = Math.max(0, Math.min(100, progress))

  return (
    <header className="w-full">
      <div className="flex items-center gap-3">
        {/* Playful Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-12 w-12 rounded-2xl bg-card border-2 border-border shadow-md hover:scale-105 hover:bg-secondary/50 transition-all duration-200"
        >
          <ArrowLeft className="h-6 w-6 text-primary" />
        </Button>

        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl md:text-2xl text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>

        {/* Child Avatar & Progress */}
        <div className="flex items-center gap-3">
          {childName && (
            <div className="hidden sm:flex items-center gap-2 bg-card rounded-2xl px-3 py-2 border-2 border-border shadow-md">
              <Avatar className="h-9 w-9 border-2 border-kids-yellow">
                <AvatarFallback className="bg-kids-yellow text-foreground font-bold text-sm">
                  {initials(childName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold text-foreground">
                {childName}
              </span>
            </div>
          )}

          {/* Circular Progress with Stars */}
          <div className="relative flex items-center justify-center">
            <div className="relative h-14 w-14">
              {/* Background Circle */}
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(safeProgress / 100) * 150.8} 150.8`}
                  className="text-kids-green transition-all duration-500 ease-out"
                />
              </svg>
              {/* Center Star Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Star className="h-5 w-5 text-kids-yellow fill-kids-yellow" />
              </div>
            </div>
            {/* Progress Text */}
            <span className="absolute -bottom-1 text-xs font-bold bg-kids-green text-white px-2 py-0.5 rounded-full shadow-sm">
              {safeProgress}%
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ActivityHeader
