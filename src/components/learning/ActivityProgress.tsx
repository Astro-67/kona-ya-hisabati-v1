export interface ActivityProgressProps {
  current: number
  total: number
}

export function ActivityProgress({ current, total }: ActivityProgressProps) {
  const safeTotal = Math.max(1, total)
  const safeCurrent = Math.max(0, Math.min(safeTotal, current))
  const percent = Math.round((safeCurrent / safeTotal) * 100)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Question {safeCurrent} of {safeTotal}</div>
        <div className="text-xs text-muted-foreground">{percent}%</div>
      </div>

      <div
        className="h-2 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={safeCurrent}
        aria-label={`Question progress ${percent}%`}
      >
        <div
          className="h-2 rounded-full bg-(--color-primary) transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default ActivityProgress
