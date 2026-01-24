"use client"

import { CheckCircle2, Sparkles, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export interface ActivityFeedbackProps {
  isCorrect?: boolean | null
  correctText?: string
  incorrectText?: string
}

export function ActivityFeedback({
  isCorrect = null,
  correctText = "Correct! Great job!",
  incorrectText = "Not quite. Try again!",
}: ActivityFeedbackProps) {
  if (typeof isCorrect !== "boolean") return null

  const isOk = Boolean(isCorrect)

  return (
    <Card
      className={`border-2 overflow-hidden transition-all duration-300 ${
        isOk
          ? "border-kids-green bg-kids-green/10"
          : "border-destructive bg-destructive/10"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4" role="status" aria-live="polite">
          {/* Animated Icon */}
          <div
            className={`relative flex items-center justify-center h-14 w-14 rounded-2xl shadow-lg ${
              isOk ? "bg-kids-green" : "bg-destructive"
            }`}
          >
            {isOk ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-white animate-pop" />
                {/* Floating Sparkles */}
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-kids-yellow animate-float" />
              </>
            ) : (
              <XCircle className="h-8 w-8 text-white animate-wiggle" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1">
            <p
              className={`font-bold text-lg ${
                isOk ? "text-kids-green" : "text-destructive"
              }`}
            >
              {isOk ? correctText : incorrectText}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isOk ? "Keep up the amazing work!" : "Don't give up, you can do it!"}
            </p>
          </div>

          {/* Decorative Elements */}
          {isOk && (
            <div className="hidden sm:flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full bg-kids-yellow animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityFeedback
