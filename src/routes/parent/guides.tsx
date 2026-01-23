import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const Route = createFileRoute('/parent/guides')({
  component: ParentGuidesList,
});

function ParentGuidesList() {
  // Fetch parent guides
  const { data, isLoading, isError } = useQuery({
    queryKey: ['parent-guides'],
    queryFn: async () => {
      const res = await apiClient.get('/parent/guides/');
      return Array.isArray(res.data) ? res.data : res.data?.results ?? [];
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
    return <div className="text-center text-destructive py-8">Failed to load guides.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Parent Guides</h1>
      <div className="space-y-6">
        {data.length === 0 && (
          <div className="text-center text-muted-foreground">No guides found.</div>
        )}
        {data.map((guide: any) => (
          <Card key={guide.id} className="p-6 rounded-xl shadow-md bg-white flex flex-col gap-4">
            <div className="text-lg font-semibold mb-2 text-primary">{guide.title}</div>
            <div className="mb-2 text-muted-foreground">{guide.description}</div>
            {guide.video_url && (
              <div className="w-full aspect-video rounded-lg overflow-hidden mb-2">
                <iframe
                  src={guide.video_url}
                  title={guide.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
            {guide.pdf_url && (
              <a
                href={guide.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-accent font-medium underline"
              >
                Download PDF Guide
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
