import { Card, CardContent } from '@/components/ui/card'

export interface ActivityFeedbackProps {
  /** true = correct, false = incorrect. If undefined/null, render nothing */
  isCorrect?: boolean | null
  correctText?: string
  incorrectText?: string
}

export function ActivityFeedback({ isCorrect = null, correctText = 'Correct! Great job.', incorrectText = 'Not quite. Try again.' }: ActivityFeedbackProps) {
  // Render nothing if feedback is not yet available
  if (typeof isCorrect !== 'boolean') return null

  const isOk = Boolean(isCorrect)

  const containerClass = isOk
    ? 'border-green-200 bg-green-50 text-green-900'
    : 'border-red-200 bg-red-50 text-red-900'

  const icon = isOk ? '✅' : '❌'
  const message = isOk ? correctText : incorrectText

  return (
    <Card className={containerClass}>
      <CardContent>
        <div className="flex items-start gap-3" role="status" aria-live="polite">
          <div className={`rounded-full p-2 ${isOk ? 'bg-green-100' : 'bg-red-100'}`}>{icon}</div>
          <div className="text-sm font-medium">{message}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityFeedback
