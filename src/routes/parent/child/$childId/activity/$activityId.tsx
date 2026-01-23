import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const Route = createFileRoute('/parent/child/$childId/activity/$activityId')({
  component: ActivityPlayer,
});

function ActivityPlayer() {
  let { childId, activityId } = Route.useParams();
  childId = String(childId);
  activityId = String(activityId);

  // Fetch activity details (questions, etc)
  const { data: activity, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity', activityId],
    enabled: !!activityId && activityId !== 'undefined',
    queryFn: async () => {
      const res = await apiClient.get(`/content/activities/${activityId}/`);
      return res.data;
    },
  });

  // State for answers and progress
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Submit answers mutation
  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      return apiClient.post(`/content/activities/${activityId}/submit/`, payload);
    },
    onSuccess: () => {
      setShowReward(true);
      setSubmitted(true);
      refetch();
    },
  });

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

  // Handle answer change
  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ child: childId, answers });
  };

  // Progress calculation (simple: answered/total)
  const total = activity.questions?.length || 0;
  const answered = Object.keys(answers).length;
  const progress = total ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="container mx-auto px-2 py-6 max-w-2xl flex flex-col items-center space-y-6">
      <Card className="w-full p-0 bg-gradient-to-br from-card via-white to-muted rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center pt-4 pb-4 px-2">
          {activity.category?.icon && <span className="text-5xl mb-2">{activity.category.icon}</span>}
          <div className="text-primary text-sm font-semibold mb-1">{activity.category?.name}</div>
          <h1 className="text-3xl font-bold text-center mb-1">{activity.title || 'Activity'}</h1>
          <div className="mb-2 text-muted-foreground text-center">{activity.description}</div>
          {activity.instructions && (
            <div className="mb-2 text-primary font-semibold text-center">{activity.instructions}</div>
          )}
        </div>

        {/* Reward */}
        {showReward && (
          <div className="mb-4 p-4 rounded-xl bg-accent/20 text-accent text-center font-semibold">
            🎉 Congratulations! You completed the activity!
          </div>
        )}

        {/* Questions */}
        <form onSubmit={handleSubmit} className="px-2 pb-6">
          <div className="space-y-6">
            {activity.questions?.map((q: any, idx: number) => (
              <Card key={q.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center">
                <div className="font-semibold text-lg text-center mb-2">{idx + 1}. {q.question_text}</div>
                {/* Render counting objects if display_mode is count_objects */}
                {q.config_data?.display_mode === 'count_objects' && q.config_data?.object_image_url && q.config_data?.object_count > 0 ? (
                  <div className="flex justify-center flex-wrap gap-5 my-4">
                    {Array.from({ length: q.config_data.object_count }).map((_, i) => {
                      // Animation support
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
                    <img
                      src={q.question_image_display}
                      alt="Question visual"
                      className="mb-3 rounded-lg mx-auto"
                      style={{ maxWidth: 180, maxHeight: 180 }}
                    />
                  )
                )}
                {/* tap_select type: show answer options as grid buttons */}
                {q.question_type === 'tap_select' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full mt-2">
                    {q.answers?.map((ans: any) => (
                      <button
                        key={ans.id}
                        type="button"
                        className={`rounded-xl py-3 font-bold border-2 transition text-lg shadow-md hover:scale-105 transition-transform flex flex-col items-center justify-center min-h-16 min-w-16 focus:outline-none focus:ring-2 focus:ring-primary/50 ${answers[q.id] === ans.answer_value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground'}`}
                        onClick={() => !submitted && handleAnswer(q.id, ans.answer_value)}
                        disabled={submitted}
                      >
                        {ans.answer_image_display && (
                          <img src={ans.answer_image_display} alt={ans.answer_text} className="mb-1 w-10 h-10 object-contain" />
                        )}
                        <span>{ans.answer_text}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    className="border rounded px-3 py-1 w-full text-center text-lg"
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={e => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                  />
                )}
              </Card>
            ))}
          </div>

          {/* Footer: Progress and Submit */}
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
            <Button type="submit" className="bg-primary text-primary-foreground" disabled={submitted || submitMutation.isPending}>
              {submitted ? 'Submitted' : submitMutation.isPending ? 'Submitting...' : 'Submit Answers'}
            </Button>
          </div>
        </form>

        {/* Reward points */}
        {activity.points_reward && (
          <div className="mt-4 text-center text-accent font-semibold">Reward: {activity.points_reward} points</div>
        )}
      </Card>
    </div>
  );
}
