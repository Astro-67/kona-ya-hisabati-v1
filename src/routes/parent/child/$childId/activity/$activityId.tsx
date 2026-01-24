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


export const Route = createFileRoute('/parent/child/$childId/activity/$activityId')({
  component: ActivityPlayer,
});

function ActivityPlayer() {
  let { childId, activityId } = Route.useParams();
  childId = String(childId);
  activityId = String(activityId);

  const queryClient = useQueryClient();

  // Fetch activity details (questions, etc)
  const { data: activity, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity', activityId],
    enabled: !!activityId && activityId !== 'undefined',
    queryFn: async () => {
      const res = await apiClient.get(`/content/activities/${activityId}/`);
      return res.data;
    },
  });

  // Local UI state
  const [answers, setAnswers] = useState<Record<string, any>>({});
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
      const id = res?.data?.attempt_id || res?.data?.id || res?.data?.attemptId;
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

  // Content submit mutation (kept near other mutations so hooks run in stable order)
  const contentSubmitMutation = useMutation({
    mutationFn: async (payload: any) => apiClient.post(`/content/activities/${activityId}/submit/`, payload),
    onSuccess: () => {
      refetch();
    },
  });

  // Ensure we start an attempt once per activity session when activity loads
  useEffect(() => {
    if (!activity) return;
    if (attemptId) return; // already started in this session

    startAttemptMutation.mutate({ activity_id: activityId, student_id: childId });

  }, [activity]);

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

  // Progress calculation (answered/total)
  const total = activity.questions?.length || 0;
  const answered = Object.keys(answers).length;
  const progress = total ? Math.round((answered / total) * 100) : 0;

  // Local helper to record answer and start timing for that question
  const handleAnswer = (questionId: string, value: any) => {
    startQuestionTimer(questionId);
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // stop timing for current question and compute totals
    const { totalTime } = stopAndGetTotals();

    // Prepare progress submit payload
    const submitPayload = {
      attempt_id: attemptId,
      answers,
      time_spent: totalTime,
      student_id: childId,
    };

    // If attempt hasn't been started yet, start it, then submit in the start callback (non-blocking)
    if (!attemptId) {
      startAttemptMutation.mutate({ activity_id: activityId, student_id: childId }, {
        onSuccess: (res: any) => {
          const id = res?.data?.attempt_id || res?.data?.id || res?.data?.attemptId;
          if (id) {
            const payloadWithId = { ...submitPayload, attempt_id: id };
            submitAttemptMutation.mutate(payloadWithId);
            // Also call content submit
            contentSubmitMutation.mutate({ child: childId, answers });
            // If finished, complete
            if (answered >= total) {
              completeAttemptMutation.mutate({ attempt_id: id, answers, time_spent: totalTime, student_id: childId });
            }
          }
        },
      });
    } else {
      // Non-blocking submit attempt
      submitAttemptMutation.mutate(submitPayload);
      // Continue to call content submit as before
      contentSubmitMutation.mutate({ child: childId, answers });

      // If this was the last question, complete attempt
      if (answered >= total) {
        completeAttemptMutation.mutate({ attempt_id: attemptId, answers, time_spent: totalTime, student_id: childId });
      }
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
          title={activity.title || 'Activity'}
          subtitle={activity.category?.name}
          childName={undefined}
          progress={progress}
          onBack={() => window.history.back()}
        />

        <div className="mt-6 space-y-4">
          {/* Activity Info */}
          <ActivityInfo
            title={activity.title || 'Activity'}
            instructions={activity.instructions}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {activity.questions?.map((q: any, idx: number) => (
                <Card key={q.id} className="border-2 border-border bg-card shadow-xl overflow-hidden">
                  <CardContent className="p-6">
                    {/* Question Number Badge */}
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg">
                        <Sparkles className="h-4 w-4" />
                        <span className="font-bold">Question {idx + 1}</span>
                      </div>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-xl md:text-2xl font-bold text-center text-foreground mb-6">{q.question_text}</h3>

                    {/* Visuals (count objects / image) */}
                    {q.config_data?.display_mode === 'count_objects' && q.config_data?.object_image_url && q.config_data?.object_count > 0 ? (
                      <div className="flex justify-center flex-wrap gap-5 my-4">
                        {Array.from({ length: q.config_data.object_count }).map((_, i) => {
                          const anim = q.config_data.animation || {};
                          let animClass = '';
                          if (anim.animate_in) {
                            if (anim.animation_type === 'bounce') animClass = 'animate-bounce';
                            else if (anim.animation_type === 'pulse') animClass = 'animate-pulse';
                            else if (anim.animation_type === 'spin') animClass = 'animate-spin';
                          }
                          const delay = anim.animate_in && anim.delay_between ? i * anim.delay_between : 0;
                          return (
                            <img
                              key={i}
                              src={q.config_data.object_image_url}
                              alt="Object"
                              className={`w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-sm ${animClass}`}
                              style={animClass ? { animationDelay: `${delay}ms` } : {}}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      q.question_image_display && (
                        <img src={q.question_image_display} alt="Question visual" className="mb-3 rounded-lg mx-auto" style={{ maxWidth: 180, maxHeight: 180 }} />
                      )
                    )}

                    {/* Answers */}
                    {q.question_type === 'tap_select' ? (
                      <div className="grid grid-cols-2 gap-3">
                        {q.answers?.map((ans: any, aidx: number) => {
                          const isSelected = answers[q.id] === ans.answer_value;
                          const isCorrectAnswer = ans.answer_value === q.correct_answer || ans.is_correct;
                          const showResult = answers[q.id] !== undefined || submitted;

                          let buttonStyle = 'bg-card border-2 border-border hover:border-primary hover:bg-primary/5';
                          if (showResult) {
                            if (isCorrectAnswer) {
                              buttonStyle = 'bg-kids-green/20 border-2 border-kids-green text-kids-green';
                            } else if (isSelected) {
                              buttonStyle = 'bg-destructive/20 border-2 border-destructive text-destructive';
                            } else {
                              buttonStyle = 'bg-muted border-2 border-muted opacity-50';
                            }
                          }

                          return (
                            <button
                              key={ans.id}
                              type="button"
                              onClick={() => !submitted && (startQuestionTimer(q.id), handleAnswer(q.id, ans.answer_value))}
                              disabled={submitted || answers[q.id] !== undefined}
                              className={`relative p-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed ${buttonStyle}`}
                            >
                              <span className="absolute top-2 left-2 h-6 w-6 rounded-lg bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">{String.fromCharCode(65 + aidx)}</span>
                              <span className="block mt-4">{ans.answer_text}</span>
                              {showResult && (isCorrectAnswer) && <Star className="absolute top-2 right-2 h-5 w-5 text-kids-yellow fill-kids-yellow" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <input
                        className="border rounded px-3 py-1 w-full text-center text-lg"
                        type="text"
                        value={answers[q.id] || ''}
                        onFocus={() => startQuestionTimer(q.id)}
                        onChange={(e) => handleAnswer(q.id, e.target.value)}
                        disabled={submitted}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Footer: Progress and Submit */}
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
                <Button type="submit" className="bg-primary text-primary-foreground" disabled={submitted || submitAttemptMutation.isPending || completeAttemptMutation.isPending}>
                  {submitted ? 'Submitted' : submitAttemptMutation.isPending || completeAttemptMutation.isPending ? 'Submitting...' : 'Submit Answers'}
                </Button>
              </div>
            </form>
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
                  <span className="text-2xl font-bold text-primary">{completedScore ?? Object.values(answers).filter((a) => !!a).length}</span>
                  <span className="text-muted-foreground">out of</span>
                  <span className="text-2xl font-bold text-foreground">{total}</span>
                  <span className="text-muted-foreground">correct!</span>
                </div>

                <Button
                  onClick={() => {
                    // Reset local UI state but keep activity data
                    setAnswers({});
                    setSubmitted(false);
                    setShowReward(false);
                    setCompletedScore(null);
                    refetch();
                  }}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Play Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}