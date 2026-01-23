import * as React from 'react'
import TapSelectQuestion from './TapSelectQuestion.tsx'

export interface CountObjectsQuestionProps {
  question: any
  /** controlled value */
  value?: number | ''
  /** disabled state */
  disabled?: boolean
  onAnswer?: (count: number, isCorrect?: boolean) => void
  /** whether this component should render the visual objects itself */
  renderObjects?: boolean
}

export function CountObjectsQuestion({ question, onAnswer, value: propValue, disabled = false, renderObjects = true }: CountObjectsQuestionProps) {
  const config = question?.config_data ?? {}
  const count = Math.max(0, Math.floor(config.object_count ?? 0))
  const imageUrl = config.object_image_url ?? null
  const correct = config.correct_answer ?? config.correct_answer_value ?? undefined

  const [internal, setInternal] = React.useState<number | ''>(propValue ?? '')

  React.useEffect(() => {
    setInternal(propValue ?? '')
  }, [propValue])

  const current = propValue !== undefined ? propValue : internal

  const answers = Array.from({ length: count + 1 }).map((_, i) => ({ id: i, answer_value: i, answer_text: String(i) }))

  const promptText = question?.question_text_en ?? question?.question_text_sw ?? question?.question_text ?? question?.prompt

  const handleSelect = (v: any, isCorrect: boolean) => {
    if (propValue === undefined) setInternal(v)
    onAnswer?.(Number(v), isCorrect)
  }

  return (
    <div className="space-y-3">
      {question?.prompt ? <div className="text-sm font-medium">{question.prompt}</div> : null}

      <div className="flex flex-wrap gap-4 justify-center my-2">
        {renderObjects ? (
          count > 0 ? (
            Array.from({ length: count }).map((_, i) => {
              const anim = config.animation || {}
              let animClass = ''
              if (anim.animate_in) {
                if (anim.animation_type === 'bounce') animClass = 'animate-bounce'
                else if (anim.animation_type === 'pulse') animClass = 'animate-pulse'
                else if (anim.animation_type === 'spin') animClass = 'animate-spin'
              }
              const delay = anim.animate_in && anim.delay_between ? i * anim.delay_between : 0

              return (
                <div
                  key={i}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden ${animClass}`}
                  style={animClass ? { animationDelay: `${delay}ms` } : {}}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={`object ${i + 1}`} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-(--color-kids-yellow)" />
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-sm text-muted-foreground">No objects to display.</div>
          )
        ) : null}
      </div>

      <TapSelectQuestion
        answers={answers}
        value={current}
        disabled={disabled}
        correctAnswer={correct}
        onSelect={handleSelect}
        prompt={promptText ?? 'How many objects?'}
      />
    </div>
  )
}

export default CountObjectsQuestion