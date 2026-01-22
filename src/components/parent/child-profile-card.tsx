import { Button } from '@/components/ui/button'

export interface Child {
  id: number | string
  name: string
  age?: number | null
}

export function ChildProfileCard({ child, onClick }: { child: Child; onClick?: () => void }) {
  const getInitials = (name?: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div
      role="button"
      onClick={onClick}
      className="cursor-pointer rounded-md border bg-card p-4 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-var(--color-kids-yellow)text-sm font-semibold text-black">
          {getInitials(child.name)}
        </div>

        <div>
          <div className="font-medium">{child.name}</div>
          {typeof child.age === 'number' ? <div className="text-sm text-muted-foreground">Age {child.age}</div> : null}
        </div>

        <div className="ml-auto">
          <Button size="sm" variant="ghost">
            View
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChildProfileCard
