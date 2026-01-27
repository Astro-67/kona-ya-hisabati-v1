import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  Home,
  Sparkles,
  Video,
} from 'lucide-react';
import type { ParentGuide } from '@/types';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { GuideCard } from '@/components/parent/guide-card';
import { GuideCardSkeleton } from '@/components/parent/guide-card-skeleton';

export const Route = createFileRoute('/parent/guides/$guideId')({
  component: ParentGuideDetail,
});

const resourceTypeConfig = {
  text_guide: { label: 'Guide', icon: BookOpen },
  video_tutorial: { label: 'Video', icon: Video },
  offline_activity: { label: 'Activity', icon: Home },
};

const guideTypeLabels: Record<ParentGuide['guide_type'], string> = {
  learning_tips: 'Learning Tips',
  activity_ideas: 'Activity Ideas',
  progress_help: 'Progress Help',
  motivation: 'Motivation',
  development: 'Development',
  homework_help: 'Homework Help',
};

const ageGroupLabels: Record<ParentGuide['age_group'], string> = {
  pre_primary: 'Pre-Primary',
  standard_1: 'Standard 1',
  standard_2: 'Standard 2',
  all: 'All Ages',
};

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderMarkdown = (content: string) => {
  const sanitized = escapeHtml(content);
  const withHeadings = sanitized
    .replace(/^###\s(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s(.+)$/gm, '<h1>$1</h1>');
  const withBold = withHeadings.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const withItalic = withBold.replace(/\*(.+?)\*/g, '<em>$1</em>');
  const withCode = withItalic.replace(/`([^`]+)`/g, '<code>$1</code>');
  const withListItems = withCode.replace(/^(?:-|\*)\s+(.+)$/gm, '<li>$1</li>');
  const withLists = withListItems.replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>');
  return withLists.replace(/\n/g, '<br />');
};

const isVideoFile = (url: string) => /\.(mp4|webm|ogg)(\?|$)/i.test(url);

function ParentGuideDetail() {
  const navigate = useNavigate();
  const { guideId } = Route.useParams();
  const [imageError, setImageError] = useState(false);

  const {
    data: guide,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['parent-guide', guideId],
    enabled: Boolean(guideId),
    queryFn: async () => {
      const res = await apiClient.get(`/parent/guides/${guideId}/`);
      return res.data as ParentGuide;
    },
  });

  const { data: relatedGuides, isLoading: relatedLoading } = useQuery({
    queryKey: ['parent-guide-related', guide?.category],
    enabled: Boolean(guide?.category),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (guide?.category) params.append('category', String(guide.category));
      params.append('page_size', '4');
      const res = await apiClient.get(`/parent/guides/?${params.toString()}`);
      const data = res.data;
      if (Array.isArray(data)) return data;
      return Array.isArray(data?.results) ? data.results : [];
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as { message?: string }).message ||
          'Failed to load the guide. Please try again.'
      );
    }
  }, [isError, error]);

  const resource = guide ? resourceTypeConfig[guide.resource_type] : null;
  const ResourceIcon = resource?.icon ?? BookOpen;

  const materials = useMemo(() => {
    if (!guide?.materials_needed) return [];
    return guide.materials_needed
      .split(/\r?\n|,/) 
      .map((item) => item.trim())
      .filter(Boolean);
  }, [guide?.materials_needed]);

  const contentMarkup = useMemo(() => {
    if (!guide?.content) return '';
    return renderMarkdown(guide.content);
  }, [guide?.content]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        type="button"
        variant="ghost"
        className="mb-6 min-h-11 gap-2"
        onClick={() => navigate({ to: '/parent/guides' })}
        aria-label="Back to guides"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to guides
      </Button>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-56 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-6 w-2/3 rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-muted/40 animate-pulse" />
        </div>
      ) : isError || !guide ? (
        <ErrorMessage message="We couldn’t load this guide." onRetry={() => refetch()} />
      ) : (
        <div className="space-y-8">
          <Card className="overflow-hidden rounded-2xl border border-border p-0 gap-0">
            <div className="relative w-full aspect-video max-h-80 sm:max-h-90">
              {guide.video_url ? (
                isVideoFile(guide.video_url) ? (
                  <div className="flex h-full w-full items-center justify-center bg-black/5">
                    <video
                      className="h-full w-full object-contain"
                      controls
                      preload="metadata"
                    >
                      <source src={guide.video_url} />
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video w-full">
                    <iframe
                      src={guide.video_url}
                      title={guide.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                )
              ) : guide.thumbnail && !imageError ? (
                <img
                  src={guide.thumbnail}
                  alt={guide.title}
                  onError={() => setImageError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 via-secondary/20 to-accent/20">
                  <ResourceIcon className="h-12 w-12 text-primary/70" />
                </div>
              )}

              {guide.is_featured && (
                <Badge className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground shadow-md">
                  <Sparkles className="h-4 w-4" />
                  Featured
                </Badge>
              )}

              {resource ? (
                <Badge className="absolute right-4 top-4 border border-primary/20 bg-primary/10 text-primary">
                  {resource.label}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">{guide.title}</h1>
                <p className="text-muted-foreground">{guide.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {guide.category_detail.name ? (
                  <Badge
                    className="border"
                    style={{
                      backgroundColor: `${guide.category_detail.color}20`,
                      color: guide.category_detail.color,
                      borderColor: `${guide.category_detail.color}40`,
                    }}
                  >
                    {guide.category_detail.name}
                  </Badge>
                ) : null}
                <Badge className="border border-primary/30 bg-transparent text-primary">
                  {ageGroupLabels[guide.age_group]}
                </Badge>
                <Badge className="border border-accent/30 bg-transparent text-accent">
                  {guideTypeLabels[guide.guide_type]}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {guide.duration_minutes ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {guide.duration_minutes} min
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {guide.view_count} views
                </span>
              </div>
            </div>
          </Card>

          {guide.video_url ? null : null}

          <Card className="rounded-2xl border border-border p-6">
            <h2 className="mb-3 text-xl font-bold text-foreground">Guide Details</h2>
            {guide.content ? (
              <div
                className="prose max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: contentMarkup }}
              />
            ) : (
              <p className="text-muted-foreground">No additional details provided yet.</p>
            )}
          </Card>

          {materials.length > 0 ? (
            <Card className="rounded-2xl border border-border p-6">
              <h2 className="mb-3 text-xl font-bold text-foreground">Materials Needed</h2>
              <ul className="list-disc pl-5 text-muted-foreground">
                {materials.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Related Guides</h2>
            {relatedLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <GuideCardSkeleton key={index} />
                ))}
              </div>
            ) : relatedGuides && relatedGuides.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides
                  .filter((item: ParentGuide) => item.id !== guide.id)
                  .slice(0, 4)
                  .map((item: ParentGuide) => (
                    <GuideCard
                      key={item.id}
                      guide={item}
                      onClick={() =>
                        navigate({
                          to: '/parent/guides/$guideId',
                          params: { guideId: String(item.id) },
                        })
                      }
                    />
                  ))}
              </div>
            ) : (
              <EmptyState
                title="No related guides"
                description="Check back later for more tips in this category."
                className="rounded-xl border border-dashed border-border bg-muted/30"
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
