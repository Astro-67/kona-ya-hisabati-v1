import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface ActivityInfoProps {
  title: string
  instructions?: string
  score: number
  maxScore: number
  categoryIcon?: ReactNode
}

export function ActivityInfo({ title, instructions, score, maxScore, categoryIcon }: ActivityInfoProps) {
  const safeScore = Math.max(0, Math.min(maxScore, score))

  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="flex-none">
            {categoryIcon ? (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">{categoryIcon}</div>
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="font-semibold text-lg">{title}</div>
              <Badge variant="primary" className="ml-auto">
                {safeScore}/{maxScore}
              </Badge>
            </div>

            {instructions ? <div className="text-sm text-muted-foreground mt-2">{instructions}</div> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityInfo
