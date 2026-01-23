import { Input } from '@/components/ui/input'
import type { ChangeEvent } from 'react'

export interface TextInputQuestionProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  prompt?: string
}

export function TextInputQuestion({ value, onChange, disabled = false, placeholder = '', prompt }: TextInputQuestionProps) {
  return (
    <div className="space-y-3 w-full">
      {prompt ? <div className="text-sm font-medium text-center">{prompt}</div> : null}

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <Input
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value)}
            disabled={disabled}
            placeholder={placeholder}
            className="text-center text-2xl py-3 px-4"
          />
        </div>
      </div>
    </div>
  )
}

export default TextInputQuestion
