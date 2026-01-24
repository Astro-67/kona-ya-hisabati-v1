"use client"

import { BookOpen, Trophy } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface ActivityInfoProps {
  title: string
  instructions?: string
  score: number
  maxScore: number
  categoryIcon?: ReactNode
}

export function ActivityInfo({
  title,
  instructions,
  score,
  maxScore,
  categoryIcon,
}: ActivityInfoProps) {
  const safeScore = Math.max(0, Math.min(maxScore, score))
  const hasScore = safeScore > 0

  return (
    <Card className="border-2 border-border bg-card overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Category Icon with Fun Background */}
          <div className="flex-none">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-sm">
                {categoryIcon ? (
                  <div className="text-primary">{categoryIcon}</div>
                ) : (
                  <BookOpen className="h-7 w-7 text-primary" />
                )}
              </div>
              {/* Decorative Dot */}
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-kids-yellow border-2 border-card shadow-sm" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-bold text-lg text-foreground truncate">
                {title}
              </h2>

              {/* Score Badge */}
              <Badge
                className={`shrink-0 px-3 py-1.5 rounded-xl font-bold text-sm gap-1.5 ${
                  hasScore
                    ? "bg-kids-green text-white border-kids-green"
                    : "bg-muted text-muted-foreground border-muted"
                }`}
              >
                <Trophy
                  className={`h-4 w-4 ${
                    hasScore ? "text-kids-yellow fill-kids-yellow" : ""
                  }`}
                />
                {safeScore}/{maxScore}
              </Badge>
            </div>

            {instructions && (
              <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {instructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityInfo
