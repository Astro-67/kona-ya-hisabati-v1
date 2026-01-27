import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import type { PaginatedResponse, ParentGuide } from '@/types';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorMessage } from '@/components/ui/error-message';
import { GuideCard } from '@/components/parent/guide-card';
import { GuideCardSkeleton } from '@/components/parent/guide-card-skeleton';
import { GuidesFilters } from '@/components/parent/guides-filters';

export const Route = createFileRoute('/parent/guides/')({
  component: ParentGuidesList,
});

function ParentGuidesList() {
  const navigate = useNavigate();
  const [resourceType, setResourceType] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [guideTypes, setGuideTypes] = useState<Array<string>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [resourceType, ageGroup, guideTypes.join('|'), searchQuery]);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams();
    if (resourceType) searchParams.append('resource_type', resourceType);
    if (ageGroup) searchParams.append('age_group', ageGroup);
    guideTypes.forEach((type) => searchParams.append('guide_type', type));
    if (searchQuery) searchParams.append('search', searchQuery);
    searchParams.append('page', String(currentPage));
    return searchParams.toString();
  }, [resourceType, ageGroup, guideTypes, searchQuery, currentPage]);

  const {
    data: guidesResponse,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['parent-guides', resourceType, ageGroup, guideTypes, searchQuery, currentPage],
    queryFn: async () => {
      const res = await apiClient.get(`/parent/guides/?${params}`);
      const data = res.data;
      if (Array.isArray(data)) {
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        } as PaginatedResponse<ParentGuide>;
      }
      return data as PaginatedResponse<ParentGuide>;
    },
    placeholderData: keepPreviousData,
  });

  const {
    data: featuredGuides,
    isLoading: featuredLoading,
    isError: featuredError,
    error: featuredErrorData,
  } = useQuery({
    queryKey: ['featured-guides'],
    queryFn: async () => {
      const res = await apiClient.get('/parent/guides/featured/');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(
        (error as { message?: string }).message ||
          'Failed to load guides. Please try again.'
      );
    }
  }, [isError, error]);

  useEffect(() => {
    if (featuredError) {
      toast.error(
        (featuredErrorData as { message?: string }).message ||
          'Failed to load featured guides.'
      );
    }
  }, [featuredError, featuredErrorData]);

  const guides = Array.isArray(guidesResponse?.results)
    ? guidesResponse.results
    : [];
  const totalCount = guidesResponse?.count ?? guides.length;
  const pageSize = guides.length || 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const showPagination = totalPages > 1;

  const handleNavigateGuide = (guideId: number) => {
    navigate({
      to: '/parent/guides/$guideId',
      params: { guideId: String(guideId) },
    });
  };

  const handleClearFilters = () => {
    setResourceType('');
    setAgeGroup('');
    setGuideTypes([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Parent Guides</h1>
        <p className="text-muted-foreground">
          Browse expert tips, videos, and activities to support your child’s math
          journey.
        </p>
      </div>

      <GuidesFilters
        resourceType={resourceType}
        ageGroup={ageGroup}
        guideTypes={guideTypes}
        searchQuery={searchQuery}
        onResourceTypeChange={setResourceType}
        onAgeGroupChange={setAgeGroup}
        onGuideTypesChange={setGuideTypes}
        onSearchQueryChange={setSearchQuery}
        onClearFilters={handleClearFilters}
      />

      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">Featured Guides</h2>
        </div>

        {featuredLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="min-w-70 max-w-[320px]">
                <GuideCardSkeleton />
              </div>
            ))}
          </div>
        ) : featuredGuides && featuredGuides.length > 0 ? (
          <div
            className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
            aria-label="Featured guides"
          >
            {featuredGuides.map((guide: ParentGuide) => (
              <div key={guide.id} className="min-w-70 max-w-[320px] snap-start">
                <GuideCard
                  guide={guide}
                  onClick={() => handleNavigateGuide(guide.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No featured guides"
            description="Featured guides will appear here once available."
            className="rounded-xl border border-dashed border-border bg-muted/30"
          />
        )}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">All Guides</h2>
          {isFetching && !isLoading ? (
            <span className="text-xs font-semibold text-muted-foreground">
              Updating...
            </span>
          ) : null}
        </div>

        {isError ? (
          <ErrorMessage
            message="We couldn’t load guides right now."
            onRetry={() => refetch()}
          />
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <GuideCardSkeleton key={index} />
            ))}
          </div>
        ) : guides.length === 0 ? (
          <EmptyState
            title="No guides match your filters"
            description="Try adjusting the filters or clearing your search to see more results."
            actionLabel="Clear Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
                onClick={() => handleNavigateGuide(guide.id)}
              />
            ))}
          </div>
        )}
      </section>

      {showPagination ? (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
