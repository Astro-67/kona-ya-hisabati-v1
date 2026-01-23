import * as React from 'react'
import TapSelectQuestion from './TapSelectQuestion.tsx'
import CountObjectsQuestion from './CountObjectsQuestion.tsx'
import TextInputQuestion from './TextInputQuestion.tsx'

export interface QuestionRendererProps {
  question: any
  value?: any
  onChange: (value: any, isCorrect?: boolean) => void
  disabled?: boolean
  /** when true, the renderer will not pass the prompt down to children (allow parent to render it) */
  skipPrompt?: boolean
}

export function QuestionRenderer({ question, value, onChange, disabled = false, skipPrompt = false }: QuestionRendererProps) {
  const type = question?.question_type
  const questionText = question?.question_text_en ?? question?.question_text_sw ?? question?.question_text ?? question?.prompt
  const prompt = !skipPrompt ? questionText : undefined

  // Image priority: question_image_display > question_image_url > question_image
  const imageUrl = question?.question_image_display ?? question?.question_image_url ?? question?.question_image ?? null

  const imageNode = imageUrl ? (
    <img
      src={imageUrl}
      alt={question?.question_text ?? 'Question image'}
      className="mx-auto my-4 max-w-70 w-full h-auto object-contain rounded-md"
    />
  ) : null

  switch (type) {
    case 'tap-select':
      return (
        <>
          {imageNode}
          <TapSelectQuestion
            answers={question.answers ?? question.options ?? []}
            value={value}
            correctAnswer={question.correct_answer ?? question.correct_answer_value}
            disabled={disabled}
            onSelect={(v, isCorrect) => onChange(v, isCorrect)}
            prompt={prompt}
          />
        </>
      )
    case 'count-objects': {
      const cfg = question?.config_data ?? {}
      const isCountDisplay = cfg.display_mode === 'count_objects'
      const objectCount = Math.max(0, Number(cfg.object_count ?? 0))
      const objectImage = cfg.object_image_url ?? null
      const anim = cfg.animation ?? {}
      const layout = cfg.layout_config ?? {}

      // object size handling: prefer explicit pixel size via layout.object_size, then layout.size
      const objectSize = layout.object_size ?? layout.size
      let sizeClass = 'w-16 h-16 md:w-20 md:h-20'
      const sizeStyle: any = {}
      if (objectSize !== undefined) {
        if (typeof objectSize === 'number') {
          sizeStyle.width = `${objectSize}px`
          sizeStyle.height = `${objectSize}px`
        } else if (typeof objectSize === 'string') {
          if (objectSize === 'small') sizeClass = 'w-12 h-12'
          else if (objectSize === 'large') sizeClass = 'w-24 h-24'
          else sizeClass = objectSize
        }
      }

      // spacing
      const spacing = layout.spacing ?? layout.gap ?? 12
      const gapStyle: any = {}
      if (typeof spacing === 'number') gapStyle.gap = `${spacing}px`

      const animClass = anim?.animate_in ? (anim.animation_type === 'bounce' ? 'animate-bounce' : anim.animation_type === 'pulse' ? 'animate-pulse' : anim.animation_type === 'spin' ? 'animate-spin' : '') : ''

      // Randomize order and jitter if requested
      const randomized = React.useMemo(() => {
        const arr = Array.from({ length: objectCount }).map((_, idx) => ({ idx }))
        if (layout.randomize) {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[arr[i], arr[j]] = [arr[j], arr[i]]
          }
        }

        return arr.map((it) => {
          const jitter = Number(layout.randomize_amount ?? layout.jitter ?? 8) || 0
          const rot = Number(layout.randomize_rotation ?? 0) || 0
          const tx = layout.randomize ? Math.round((Math.random() * 2 - 1) * jitter) : 0
          const ty = layout.randomize ? Math.round((Math.random() * 2 - 1) * jitter) : 0
          const angle = layout.randomize ? Math.round((Math.random() * 2 - 1) * rot) : 0
          const delay = anim?.delay_between ? Math.round(Math.random() * (anim.delay_between * 2)) : 0
          return { ...it, tx, ty, angle, delay }
        })
      }, [question?.id, objectCount, layout.randomize, layout.randomize_amount, layout.randomize_rotation, anim?.delay_between])

      const objectNodes = objectCount > 0 && objectImage ? (
        <div className="flex flex-wrap justify-center my-2" style={gapStyle}>
          {randomized.map(({ idx, tx, ty, angle, delay }) => (
            <div
              key={idx}
              className={`${animClass}`}
              style={{ transform: `translate(${tx}px, ${ty}px) rotate(${angle}deg)`, transition: 'transform 300ms', ...(animClass && anim.delay_between ? { animationDelay: `${delay}ms` } : {}), ...sizeStyle }}
            >
              <img src={objectImage} alt={`object ${idx + 1}`} className={`${sizeClass} object-contain rounded-md`} />
            </div>
          ))}
        </div>
      ) : null

      return (
        <>
          {imageNode}
          {isCountDisplay ? objectNodes : null}

          <CountObjectsQuestion question={question} value={value} disabled={disabled} onAnswer={(v, isCorrect) => onChange(v, isCorrect)} renderObjects={!isCountDisplay} />
        </>
      )
    }
    case 'text-input':
      return (
        <>
          {imageNode}
          <TextInputQuestion
            value={value ?? ''}
            disabled={disabled}
            onChange={(v) => onChange(v)}
            prompt={prompt}
          />
        </>
      )
    default:
      return null
  }
}

export default QuestionRenderer
