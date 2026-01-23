import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface ActivityHeaderProps {
  title: string
  subtitle?: string
  childName?: string
  progress?: number // 0 - 100
  onBack?: () => void
}

export function ActivityHeader({ title, subtitle, childName, progress = 0, onBack }: ActivityHeaderProps) {
  const initials = (name?: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const safeProgress = Math.max(0, Math.min(100, progress))

  return (
    <header className="w-full">
      <div className="flex items-start gap-4">
        <Button variant="ghost" onClick={onBack} className="px-2 py-1">
          ←
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <div className="font-semibold text-lg">{title}</div>
              {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
            </div>

            <div className="ml-auto flex items-center gap-4">
              {childName ? (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-(--color-kids-yellow) text-black">{initials(childName)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">{childName}</div>
                </div>
              ) : null}

              <div className="w-36">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-(--color-primary)" style={{ width: `${safeProgress}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{safeProgress}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default ActivityHeader
