import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const Route = createFileRoute('/parent/home-activities')({
  component: HomeActivitiesList,
});

function HomeActivitiesList() {
  // Fetch home activities
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home-activities'],
    queryFn: async () => {
      const res = await apiClient.get('/parent/home-activities/');
      return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
    },
  });

  // Mark as completed mutation
  const completeMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return apiClient.post(`/parent/home-activities/${id}/complete/`);
    },
    onSuccess: () => {
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
  if (isError) {
    return <div className="text-center text-destructive py-8">Failed to load activities.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Home Activities</h1>
      <div className="space-y-6">
        {data.length === 0 && (
          <div className="text-center text-muted-foreground">No home activities found.</div>
        )}
        {data.map((activity: any) => (
          <Card key={activity.id} className="p-6 rounded-xl shadow-md bg-white flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="text-lg font-semibold mb-2 text-primary">{activity.title}</div>
              <div className="mb-2 text-muted-foreground">{activity.description}</div>
              {activity.printable_url && (
                <a
                  href={activity.printable_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-accent font-medium underline"
                >
                  Download Printable
                </a>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button
                className="bg-primary text-primary-foreground"
                disabled={activity.completed || completeMutation.isPending}
                onClick={() => completeMutation.mutate(activity.id)}
              >
                {activity.completed ? 'Completed' : completeMutation.isPending ? 'Marking...' : 'Mark as Completed'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
