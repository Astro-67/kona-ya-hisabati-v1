"use client"

import { Star } from "lucide-react"

export interface ActivityProgressProps {
  current: number
  total: number
}

export function ActivityProgress({ current, total }: ActivityProgressProps) {
  const safeTotal = Math.max(1, total)
  const safeCurrent = Math.max(0, Math.min(safeTotal, current))
  const percent = Math.round((safeCurrent / safeTotal) * 100)

  return (
    <div className="w-full space-y-3">
      {/* Question Counter with Playful Styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md">
            {safeCurrent}
          </div>
          <span className="text-sm font-medium text-muted-foreground">of</span>
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-muted text-foreground font-bold text-sm">
            {safeTotal}
          </div>
          <span className="text-sm font-semibold text-foreground ml-1">
            Questions
          </span>
        </div>

        {/* Stars Earned */}
        <div className="flex items-center gap-1">
          {Array.from({ length: safeTotal }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 transition-all duration-300 ${
                i < safeCurrent
                  ? "text-kids-yellow fill-kids-yellow scale-100"
                  : "text-muted scale-90"
              }`}
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Fun Progress Track */}
      <div
        className="relative h-4 w-full rounded-full bg-muted overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-label={`Question progress ${percent}%`}
      >
        {/* Progress Fill with Gradient */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, var(--kids-blue), var(--kids-green))",
          }}
        >
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-linear-to-b from-white/30 to-transparent" />
          
          {/* Moving Sparkle */}
          <div 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white/80 animate-pulse"
          />
        </div>

        {/* Track Markers */}
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
          {Array.from({ length: safeTotal - 1 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 h-full bg-background/30"
              style={{ marginLeft: `${(100 / safeTotal) * (i + 1) - 0.5}%`, position: 'absolute', left: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Percentage Badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-card border-2 border-border rounded-full px-3 py-1 shadow-sm">
          <span className="text-sm font-bold text-primary">{percent}%</span>
          <span className="text-xs text-muted-foreground">complete</span>
        </div>
      </div>
    </div>
  )
}

export default ActivityProgress
