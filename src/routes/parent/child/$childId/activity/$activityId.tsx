import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Rocket, Sparkles, Star, Trophy } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ActivityHeader from '@/components/learning/ActivityHeader';
import ActivityInfo from '@/components/learning/ActivityInfo';
import ActivityProgress from '@/components/learning/ActivityProgress';
import ActivityFeedback from '@/components/learning/ActivityFeedback';
import { localize } from '@/lib/utils';

const resolveQuestionPrompt = (question: any) =>
  localize(
    question?.question_text ??
      question?.question_text_en ??
      question?.question_text_sw ??
      question?.prompt?.text ??
      question?.prompt
  );

const resolveQuestionType = (question: any, activityTemplate?: string) => {
  const raw = question?.question_type ?? question?.interaction_type ?? question?.type ?? activityTemplate;
  if (!raw) return '';
  const normalized = String(raw).toLowerCase();
  if (['tap_select', 'tap-select', 'multiple_choice', 'multiple-choice', 'single_choice', 'single-choice'].includes(normalized)) {
    return 'tap_select';
  }
  if (['count_objects', 'count-objects', 'object_counting', 'object-counting'].includes(normalized)) {
    return 'count_objects';
  }
  if (['text_input', 'text-input', 'fill_blank', 'fill-blank', 'free_response', 'short_answer'].includes(normalized)) {
    return 'text_input';
  }
  return normalized;
};

const resolveQuestionOptions = (question: any) => {
  const raw = question?.answers ?? question?.options ?? question?.choices ?? [];
  return Array.isArray(raw) ? raw : [];
};

const resolveAnswerValue = (answer: any) => answer?.answer_value ?? answer?.value ?? answer?.id ?? answer;

const resolveAnswerLabel = (answer: any) =>
  localize(
    answer?.answer_text ??
      answer?.answer_text_en ??
      answer?.answer_text_sw ??
      answer?.label ??
      answer?.text ??
      answer?.title ??
      answer
  );

const resolveCorrectAnswer = (question: any) =>
  question?.correct_answer ?? question?.correct_answer_value ?? question?.validation?.correct_value ?? question?.validation?.correctAnswer;

const resolveQuestionImage = (question: any) =>
  question?.question_image_display ?? question?.question_image_url ?? question?.question_image ?? question?.image_url ?? null;

const resolveAttemptId = (data: any) => {
  const direct =
    data?.attempt_id ??
    data?.attemptId ??
    data?.id ??
    data?.attempt?.id ??
    data?.attempt?.attempt_id ??
    data?.attempt?.attemptId;
  if (direct !== undefined && direct !== null) return String(direct);

  const activityFallback = data?.activity_id ?? data?.activity;
  if (activityFallback !== undefined && activityFallback !== null && data?.status) {
    return String(activityFallback);
  }

  return null;
};

const normalizeAnswer = (value: any) => {
  if (value == null) return value;
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (typeof value === 'number') return String(value);
  return String(value);
};

const hasAnswerValue = (value: any) => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const resolveIsAnswerCorrect = (question: any, answer: any) => {
  if (!hasAnswerValue(answer)) return null;
  const explicit = resolveCorrectAnswer(question);
  if (explicit !== undefined && explicit !== null) {
    return normalizeAnswer(answer) === normalizeAnswer(explicit);
  }
  const options = resolveQuestionOptions(question);
  const correctOption = options.find((opt: any) => Boolean(opt?.is_correct));
  if (correctOption) {
    return normalizeAnswer(resolveAnswerValue(correctOption)) === normalizeAnswer(answer);
  }
  return null;
};

const resolveCanGrade = (question: any) => {
  const explicit = resolveCorrectAnswer(question);
  if (explicit !== undefined && explicit !== null) return true;
  const options = resolveQuestionOptions(question);
  return options.some((opt: any) => Boolean(opt?.is_correct));
};

const resolveAnimationClass = (animation: any) => {
  if (!animation) return '';
  const isObject = typeof animation === 'object';
  if (isObject && !animation.animate_in) return '';
  const type = isObject ? animation.animation_type ?? animation.type : animation;
  const normalized = String(type ?? '').toLowerCase();
  if (normalized === 'bounce') return 'animate-bounce';
  if (normalized === 'pulse' || normalized === 'twinkle') return 'animate-pulse';
  if (normalized === 'spin') return 'animate-spin';
  return '';
};

const resolveAnimationDelay = (animation: any, index: number) => {
  if (!animation || typeof animation !== 'object') return 0;
  const delay = Number(animation.delay_between ?? 0);
  return animation.animate_in && delay > 0 ? index * delay : 0;
};

const resolveObjectVisuals = (question: any) => {
  const config = question?.config_data;
  if (config?.display_mode === 'count_objects' && config?.object_image_url && Number(config.object_count ?? 0) > 0) {
    const count = Math.max(0, Number(config.object_count ?? 0));
    return {
      items: Array.from({ length: count }).map((_, idx) => ({
        key: `cfg-${question?.id ?? 'q'}-${idx}`,
        src: config.object_image_url,
        animation: config.animation,
      })),
      background: config.background,
    };
  }

  const canvas = question?.canvas;
  const objects = Array.isArray(canvas?.objects) ? canvas.objects : [];
  if (!objects.length) return null;

  const items: Array<{ key: string; src: string; animation?: any }> = [];
  objects.forEach((obj: any, objIndex: number) => {
    const count = Math.max(0, Number(obj?.count ?? 0));
    const src = obj?.src ?? obj?.image ?? obj?.image_url ?? null;
    if (!src || count <= 0) return;
    for (let i = 0; i < count; i += 1) {
      items.push({
        key: `${obj?.id ?? objIndex}-${i}`,
        src,
        animation: obj?.animation,
      });
    }
  });

  if (!items.length) return null;
  return {
    items,
    background: canvas?.background,
  };
};


export const Route = createFileRoute('/parent/child/$childId/activity/$activityId')({
  component: ActivityPlayer,
});

function ActivityPlayer() {
  let { childId, activityId } = Route.useParams();
  childId = String(childId);
  activityId = String(activityId);

  const queryClient = useQueryClient();

  // Fetch activity details (questions, etc)
  const { data: activity, isLoading, isError } = useQuery({
    queryKey: ['activity', activityId],
    enabled: !!activityId && activityId !== 'undefined',
    queryFn: async () => {
      const res = await apiClient.get(`/content/activities/${activityId}/`);
      return res.data;
    },
  });

  const { data: currentAttempt, isLoading: isAttemptLoading } = useQuery({
    queryKey: ['activity-attempt', activityId, childId],
    enabled: !!activityId && activityId !== 'undefined' && !!childId && childId !== 'undefined',
    queryFn: async () => {
      try {
        const res = await apiClient.get('/progress/attempts/current/', {
          params: { activity_id: activityId, student_id: childId },
        });
        return res.data;
      } catch (err) {
        return null;
      }
    },
  });

  // Local UI state
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, any>>({});
  const [firstAttemptAnswers, setFirstAttemptAnswers] = useState<Record<string, any>>({});
  const [firstAttemptCorrect, setFirstAttemptCorrect] = useState<Record<string, boolean>>({});
  const [resolvedQuestions, setResolvedQuestions] = useState<Record<string, boolean>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [completedScore, setCompletedScore] = useState<number | null>(null);

  // Progress / attempt lifecycle
  const attemptStorageKey = `activity_attempt_${activityId}_${childId}`;
  const [attemptId, setAttemptId] = useState<string | null>(() => sessionStorage.getItem(attemptStorageKey));

  // Time tracking (seconds)
  const timersRef = useRef<Record<string, number>>({});
  const currentQuestionRef = useRef<string | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const pendingSubmissionRef = useRef<{ answers: Record<string, any>; totalTime: number; complete: boolean } | null>(null);

  const startQuestionTimer = (qid: string) => {
    const now = Date.now();
    // stop previous
    if (currentQuestionRef.current && startTimestampRef.current) {
      const delta = Math.round((now - startTimestampRef.current) / 1000);
      timersRef.current[currentQuestionRef.current] = (timersRef.current[currentQuestionRef.current] || 0) + delta;
    }
    currentQuestionRef.current = qid;
    startTimestampRef.current = now;
  };

  const stopAndGetTotals = () => {
    const now = Date.now();
    if (currentQuestionRef.current && startTimestampRef.current) {
      const delta = Math.round((now - startTimestampRef.current) / 1000);
      timersRef.current[currentQuestionRef.current] = (timersRef.current[currentQuestionRef.current] || 0) + delta;
      startTimestampRef.current = now;
    }
    const perQuestion = { ...timersRef.current };
    const totalTime = Object.values(perQuestion).reduce((a, b) => a + b, 0);
    return { perQuestion, totalTime };
  };

  // API mutations for progress lifecycle
  const startAttemptMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/progress/attempts/start/', payload),
    onSuccess: (res: any) => {
      const id = resolveAttemptId(res?.data);
      if (id) {
        setAttemptId(id);
        try {
          sessionStorage.setItem(attemptStorageKey, String(id));
        } catch (e) {
          // ignore
        }
      }
    },
  });

  const restartAttemptMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/progress/attempts/restart/', payload),
    onSuccess: (res: any) => {
      const id = resolveAttemptId(res?.data);
      if (id) {
        setAttemptId(id);
        try {
          sessionStorage.setItem(attemptStorageKey, String(id));
        } catch (e) {
          // ignore
        }
      }
      resetActivityState();
      queryClient.invalidateQueries({ queryKey: ['activity-attempt', activityId, childId] });
    },
  });

  const submitAttemptMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/progress/attempts/submit/', payload),
    onSuccess: () => {
      // non-blocking: we can optionally refetch progress or activity
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
    },
  });

  const completeAttemptMutation = useMutation({
    mutationFn: (payload: any) => apiClient.post('/progress/attempts/complete/', payload),
    onSuccess: (res: any) => {
      const score = res?.data?.score ?? null;
      if (typeof score === 'number') setCompletedScore(score);
      setShowReward(true);
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['activity', activityId] });
    },
  });

  // Ensure we start an attempt once per activity session when activity loads
  useEffect(() => {
    if (!activity) return;
    if (attemptId) return; // already started in this session
    if (isAttemptLoading) return;
    if (currentAttempt) return;

    startAttemptMutation.mutate({ activity_id: activityId, student_id: childId });

  }, [activity, attemptId, isAttemptLoading, currentAttempt]);

  const activityTitle = localize(activity?.title ?? activity?.meta?.title ?? activity?.name) || 'Activity';
  const activityInstructions = localize(activity?.instructions ?? activity?.description ?? activity?.meta?.description);
  const categoryLabel = localize(activity?.category?.name ?? activity?.category);
  const questions = Array.isArray(activity?.questions) ? activity?.questions : [];

  // Progress calculation (answered/total)
  const total = questions.length;
  const answered = Object.values(resolvedQuestions).filter(Boolean).length;
  const progress = total ? Math.round((answered / total) * 100) : 0;

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const currentQuestionId = currentQuestion ? String(currentQuestion.id ?? currentQuestionIndex) : '';
  const isLastQuestion = currentQuestionIndex >= total - 1;
  const currentAnswer = currentQuestionId ? currentAnswers[currentQuestionId] : undefined;
  const canGradeCurrent = currentQuestion ? resolveCanGrade(currentQuestion) : false;
  const canProceed = Boolean(currentQuestion) && (resolvedQuestions[currentQuestionId] || (!canGradeCurrent && hasAnswerValue(currentAnswer)));

  useEffect(() => {
    if (!currentAttempt) return;
    const id = resolveAttemptId(currentAttempt);
    if (id && attemptId !== id) {
      setAttemptId(id);
      try {
        sessionStorage.setItem(attemptStorageKey, String(id));
      } catch (e) {
        // ignore
      }
    }
    const status = String(currentAttempt?.status ?? '').toLowerCase();
    if (status === 'completed' && !showReward) {
      setShowReward(true);
      setSubmitted(true);
      const scoreValue = Number(currentAttempt?.score);
      if (!Number.isNaN(scoreValue)) setCompletedScore(scoreValue);
    }
  }, [currentAttempt, attemptId, attemptStorageKey, showReward]);

  useEffect(() => {
    if (!currentQuestionId) return;
    setCurrentFeedback(null);
    startQuestionTimer(currentQuestionId);
  }, [currentQuestionId]);

  useEffect(() => {
    if (!attemptId || !pendingSubmissionRef.current) return;
    const pending = pendingSubmissionRef.current;
    pendingSubmissionRef.current = null;
    submitAttemptMutation.mutate({ attempt_id: attemptId, answers: pending.answers, time_spent: pending.totalTime, student_id: childId });
    if (pending.complete) {
      completeAttemptMutation.mutate({ attempt_id: attemptId, answers: pending.answers, time_spent: pending.totalTime, student_id: childId });
    }
  }, [attemptId]);

  const resetActivityState = () => {
    setCurrentAnswers({});
    setFirstAttemptAnswers({});
    setFirstAttemptCorrect({});
    setResolvedQuestions({});
    setCurrentQuestionIndex(0);
    setCurrentFeedback(null);
    setSubmitted(false);
    setShowReward(false);
    setCompletedScore(null);
    timersRef.current = {};
    currentQuestionRef.current = null;
    startTimestampRef.current = null;
    pendingSubmissionRef.current = null;
  };

  useEffect(() => {
    resetActivityState();
  }, [activityId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (isError || !activity) {
    return <div className="text-center text-destructive py-8">Failed to load activity.</div>;
  }

  const submitProgress = (answersPayload: Record<string, any>, totalTime: number, complete: boolean) => {
    if (!attemptId) {
      pendingSubmissionRef.current = { answers: answersPayload, totalTime, complete };
      if (!startAttemptMutation.isPending) {
        startAttemptMutation.mutate({ activity_id: activityId, student_id: childId });
      }
      return;
    }

    submitAttemptMutation.mutate({ attempt_id: attemptId, answers: answersPayload, time_spent: totalTime, student_id: childId });
    if (complete) {
      completeAttemptMutation.mutate({ attempt_id: attemptId, answers: answersPayload, time_spent: totalTime, student_id: childId });
    }
  };

  const registerFirstAttempt = (questionId: string, answer: any, isCorrect: boolean | null) => {
    if (firstAttemptAnswers[questionId] !== undefined) {
      return { answersPayload: firstAttemptAnswers, correctPayload: firstAttemptCorrect };
    }
    const nextAnswers = { ...firstAttemptAnswers, [questionId]: answer };
    const nextCorrect = isCorrect === null ? firstAttemptCorrect : { ...firstAttemptCorrect, [questionId]: isCorrect };
    setFirstAttemptAnswers(nextAnswers);
    if (isCorrect !== null) setFirstAttemptCorrect(nextCorrect);
    return { answersPayload: nextAnswers, correctPayload: nextCorrect };
  };

  const handleSelectAnswer = (question: any, questionId: string, answerValue: any) => {
    if (submitted) return;
    const isResolved = Boolean(resolvedQuestions[questionId]);
    if (isResolved) return;
    setCurrentAnswers((prev) => ({ ...prev, [questionId]: answerValue }));

    const isCorrect = resolveIsAnswerCorrect(question, answerValue);
    registerFirstAttempt(questionId, answerValue, isCorrect);

    if (isCorrect === false) {
      setCurrentFeedback(false);
      return;
    }

    setResolvedQuestions((prev) => ({ ...prev, [questionId]: true }));
    setCurrentFeedback(isCorrect === true ? true : null);
  };

  const handleTextInputChange = (question: any, questionId: string, value: string) => {
    if (submitted) return;
    const isResolved = Boolean(resolvedQuestions[questionId]);
    if (isResolved) return;
    setCurrentAnswers((prev) => ({ ...prev, [questionId]: value }));
    const isCorrect = resolveIsAnswerCorrect(question, value);
    if (isCorrect === true) {
      setResolvedQuestions((prev) => ({ ...prev, [questionId]: true }));
      setCurrentFeedback(true);
    } else {
      setCurrentFeedback(null);
    }
  };

  const handleAdvance = (complete: boolean) => {
    if (!currentQuestion || !currentQuestionId) return;
    if (!hasAnswerValue(currentAnswer)) return;

    const isCorrect = resolveIsAnswerCorrect(currentQuestion, currentAnswer);
    if (isCorrect === false) {
      setCurrentFeedback(false);
      return;
    }

    const { answersPayload } = registerFirstAttempt(currentQuestionId, currentAnswer, isCorrect);
    if (!resolvedQuestions[currentQuestionId]) {
      setResolvedQuestions((prev) => ({ ...prev, [currentQuestionId]: true }));
      setCurrentFeedback(isCorrect === true ? true : null);
    }

    const { totalTime } = stopAndGetTotals();
    submitProgress(answersPayload, totalTime, complete);

    if (!complete) {
      setCurrentQuestionIndex((prev) => Math.min(prev + 1, Math.max(total - 1, 0)));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-kids-yellow/20 blur-3xl" />
        <div className="absolute top-40 right-20 h-40 w-40 rounded-full bg-kids-blue/20 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-36 w-36 rounded-full bg-kids-green/20 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-6 max-w-2xl">
        {/* Activity Header */}
        <ActivityHeader
          title={activityTitle}
          subtitle={categoryLabel}
          childName={undefined}
          progress={progress}
          onBack={() => window.history.back()}
        />

        <div className="mt-6 space-y-4">
          {/* Activity Info */}
          <ActivityInfo
            title={activityTitle}
            instructions={activityInstructions}
            score={completedScore ?? 0}
            maxScore={total}
            categoryIcon={activity.category?.icon || <Rocket className="h-7 w-7" />}
          />

          {/* Progress */}
          <ActivityProgress current={answered} total={total} />

          {/* Feedback */}
          {completedScore !== null && (
            <ActivityFeedback
              isCorrect={completedScore > 0}
              correctText={`Great job — score ${completedScore}/${total}`}
              incorrectText={`Completed — score ${completedScore}/${total}`}
            />
          )}

          {/* Questions or Reward */}
          {!showReward ? (
            <div className="space-y-4">
              {currentQuestion ? (() => {
                const questionId = currentQuestionId;
                const promptText = resolveQuestionPrompt(currentQuestion);
                const questionType = resolveQuestionType(currentQuestion, activity.template_type);
                const options = resolveQuestionOptions(currentQuestion);
                const correctAnswer = resolveCorrectAnswer(currentQuestion);
                const visuals = resolveObjectVisuals(currentQuestion);
                const questionImage = resolveQuestionImage(currentQuestion);
                const canGrade = resolveCanGrade(currentQuestion);
                const shouldUseTapSelect = questionType === 'tap_select' || questionType === 'count_objects' || (!questionType && options.length > 0);
                const isResolved = Boolean(resolvedQuestions[questionId]);
                const showCorrect = isResolved && canGrade;
                const showIncorrect = currentFeedback === false && canGrade;

                return (
                  <Card key={questionId} className="border-2 border-border bg-card shadow-xl overflow-hidden">
                    <CardContent className="p-6">
                      {/* Question Number Badge */}
                      <div className="flex justify-center mb-4">
                        <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-bold">Question {currentQuestionIndex + 1}</span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <h3 className="text-xl md:text-2xl font-bold text-center text-foreground mb-6">{promptText}</h3>

                      {/* Visuals (count objects / image) */}
                      {visuals?.items.length ? (
                        <div
                          className="flex justify-center flex-wrap gap-5 my-4"
                          style={visuals.background ? { background: visuals.background, borderRadius: '0.75rem', padding: '0.75rem' } : undefined}
                        >
                          {visuals.items.map((item, i) => {
                            const animClass = resolveAnimationClass(item.animation);
                            const delay = resolveAnimationDelay(item.animation, i);
                            return (
                              <img
                                key={item.key}
                                src={item.src}
                                alt="Object"
                                className={`w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-sm ${animClass}`}
                                style={animClass && delay ? { animationDelay: `${delay}ms` } : undefined}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        questionImage && (
                          <img src={questionImage} alt="Question visual" className="mb-3 rounded-lg mx-auto" style={{ maxWidth: 180, maxHeight: 180 }} />
                        )
                      )}

                      {/* Answers */}
                      {shouldUseTapSelect ? (
                        <div className="grid grid-cols-2 gap-3">
                          {options.map((ans: any, aidx: number) => {
                            const answerValue = resolveAnswerValue(ans);
                            const isSelected = currentAnswer === answerValue;
                            const isCorrectAnswer = Boolean(ans?.is_correct) || (canGrade && String(answerValue) === String(correctAnswer));

                            let buttonStyle = 'bg-card border-2 border-border hover:border-primary hover:bg-primary/5';
                            if (showCorrect && isCorrectAnswer) {
                              buttonStyle = 'bg-kids-green/20 border-2 border-kids-green text-kids-green';
                            } else if (showIncorrect && isSelected) {
                              buttonStyle = 'bg-destructive/20 border-2 border-destructive text-destructive';
                            } else if (isSelected) {
                              buttonStyle = 'bg-primary/10 border-2 border-primary text-primary';
                            }

                            return (
                              <button
                                key={String(ans?.id ?? answerValue ?? aidx)}
                                type="button"
                                onClick={() => handleSelectAnswer(currentQuestion, questionId, answerValue)}
                                disabled={submitted || isResolved}
                                className={`relative p-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed ${buttonStyle}`}
                              >
                                <span className="absolute top-2 left-2 h-6 w-6 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">{String.fromCharCode(65 + aidx)}</span>
                                <span className="block mt-4">{resolveAnswerLabel(ans)}</span>
                                {showCorrect && isCorrectAnswer && <Star className="absolute top-2 right-2 h-5 w-5 text-kids-yellow fill-kids-yellow" />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          className="border rounded px-3 py-1 w-full text-center text-lg"
                          type="text"
                          value={currentAnswer ?? ''}
                          onChange={(e) => handleTextInputChange(currentQuestion, questionId, e.target.value)}
                          disabled={submitted || isResolved}
                        />
                      )}

                      {currentFeedback === false && (
                        <div className="mt-4 text-center text-destructive font-semibold">Not quite. Try again!</div>
                      )}
                      {currentFeedback === true && (
                        <div className="mt-4 text-center text-kids-green font-semibold">
                          {isLastQuestion ? 'Correct! Tap Finish to complete.' : 'Correct! Tap Next to continue.'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })() : (
                <Card className="border-2 border-border bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-6 text-center text-muted-foreground">No questions found for this activity.</CardContent>
                </Card>
              )}

              {/* Footer: Progress and Navigation */}
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
                <Button
                  type="button"
                  className="bg-primary text-primary-foreground"
                  onClick={() => handleAdvance(isLastQuestion)}
                  disabled={submitted || submitAttemptMutation.isPending || completeAttemptMutation.isPending || !canProceed}
                >
                  {isLastQuestion ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          ) : (
            /* Reward Screen */
            <Card className="border-2 border-kids-yellow bg-linear-to-br from-card via-card to-kids-yellow/10 shadow-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="absolute inset-0 bg-kids-yellow/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative h-24 w-24 rounded-full bg-kids-yellow flex items-center justify-center shadow-lg">
                    <Trophy className="h-12 w-12 text-white" />
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="absolute h-6 w-6 text-kids-yellow fill-kids-yellow animate-float"
                      style={{
                        top: `${Math.random() * 60 - 30}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 200}ms`,
                      }}
                    />
                  ))}
                </div>

                <h2 className="text-3xl font-bold text-foreground mb-2">Amazing Job!</h2>
                <p className="text-lg text-muted-foreground mb-4">You completed the activity!</p>

                <div className="inline-flex items-center gap-3 bg-muted rounded-2xl px-6 py-3 mb-6">
                  <span className="text-2xl font-bold text-primary">{completedScore ?? Object.values(firstAttemptCorrect).filter(Boolean).length}</span>
                  <span className="text-muted-foreground">out of</span>
                  <span className="text-2xl font-bold text-foreground">{total}</span>
                  <span className="text-muted-foreground">correct!</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => {
                      restartAttemptMutation.mutate({ activity_id: activityId, student_id: childId });
                    }}
                    size="lg"
                    disabled={restartAttemptMutation.isPending}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {restartAttemptMutation.isPending ? 'Restarting...' : 'Play Again'}
                  </Button>
                  <Button
                    onClick={() => {
                      window.location.href = `/parent/child/${childId}/categories`;
                    }}
                    size="lg"
                    variant="outline"
                    className="font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                  >
                    Choose Another Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
