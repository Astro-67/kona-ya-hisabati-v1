import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Child {
  id: number | string
  name: string
  age?: number | null
  grade?: string | null
  progress?: number | null // 0 - 100
}

export function ChildProfileCard({ child, onClick }: { child: Child; onClick?: () => void }) {
  const initials = (name?: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const progress = typeof child.progress === 'number' ? Math.max(0, Math.min(100, child.progress)) : 0

  return (
    <Card
      onClick={onClick}
      className={cn('cursor-pointer hover:shadow-md', onClick ? 'hover:transform hover:-translate-y-0.5 transition' : '')}
    >
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback className="bg-(--color-kids-yellow) text-black">{initials(child.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{child.name}</div>
              {child.grade ? <Badge className="ml-2" variant="primary">{child.grade}</Badge> : null}
            </div>

            <div className="mt-2 flex items-center gap-3">
              <div className="w-full">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-(--color-primary)" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Progress: {progress}%</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChildProfileCard
