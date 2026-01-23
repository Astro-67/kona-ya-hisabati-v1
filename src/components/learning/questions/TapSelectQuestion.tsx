import * as React from 'react'
import { Button } from '@/components/ui/button'

export interface TapSelectQuestionProps {
  answers: Array<any>
  value?: any
  onSelect: (value: any, isCorrect: boolean) => void
  disabled?: boolean
  correctAnswer?: any
  prompt?: string
}

export function TapSelectQuestion({ answers, value: propValue, onSelect, disabled = false, correctAnswer, prompt }: TapSelectQuestionProps) {
  const [internal, setInternal] = React.useState<any>(propValue ?? null)

  React.useEffect(() => {
    setInternal(propValue ?? null)
  }, [propValue])

  const selected = propValue !== undefined ? propValue : internal

  const getId = (ans: any) => ans?.answer_value ?? ans?.id ?? ans?.value ?? ans
  const getLabel = (ans: any) => ans?.answer_text_en ?? ans?.answer_text_sw ?? ans?.answer_text ?? ans?.label ?? String(ans)
  const getImage = (ans: any) => ans?.answer_image_display ?? ans?.image ?? ans?.image_url ?? null

  const colsClass = answers.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : answers.length === 3 ? 'grid-cols-3' : 'grid-cols-2'

  return (
    <div className="space-y-4">
      {prompt ? <div className="text-sm text-muted-foreground text-center">{prompt}</div> : null}

      <div className={`grid ${colsClass} gap-4`}>
        {answers.map((ans) => {
          const id = getId(ans)
          const label = getLabel(ans)
          const image = getImage(ans)

          const isSelected = selected !== null && selected !== undefined && selected === id
          const isCorrect = correctAnswer !== undefined && correctAnswer === id
          const isIncorrect = isSelected && correctAnswer !== undefined && !isCorrect

          const base = 'w-full rounded-2xl px-4 py-5 text-lg font-semibold shadow-lg flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 min-h-[5.5rem]'

          const stateClass = isCorrect
            ? 'bg-green-600 text-white ring-2 ring-green-200'
            : isIncorrect
            ? 'bg-red-600 text-white ring-2 ring-red-200'
            : isSelected
            ? 'bg-(--color-primary) text-primary-foreground ring-2 ring-(--color-primary)/30'
            : 'bg-white border border-muted-foreground hover:bg-muted/50'

          const icon = isCorrect ? '✅' : isIncorrect ? '❌' : isSelected ? '•' : ''

          return (
            <Button
              key={String(id)}
              type="button"
              variant="ghost"
              className={`${base} ${stateClass}`}
              onClick={() => {
                if (disabled) return
                if (propValue === undefined) setInternal(id)
                onSelect(id, Boolean(correctAnswer !== undefined && correctAnswer === id))
              }}
              disabled={disabled}
              aria-pressed={isSelected}
            >
              {image ? <img src={image} alt={label} className="mb-2 w-20 h-20 object-contain rounded-md" /> : null}
              <span className="text-center">{label}</span>
              {icon ? <span className="mt-1 text-sm opacity-90">{icon}</span> : null}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default TapSelectQuestion
