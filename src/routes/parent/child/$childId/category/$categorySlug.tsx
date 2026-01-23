
import { Link, createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/lib/api';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export const Route = createFileRoute('/parent/child/$childId/category/$categorySlug')({
  component: CategoryActivitiesPage,
});

function CategoryActivitiesPage() {
  let { childId, categorySlug } = Route.useParams();
  childId = String(childId);
  categorySlug = String(categorySlug);
  const [difficulty, setDifficulty] = useState('');

  const { data: activities } = useQuery({
    queryKey: ['category-activities', categorySlug],
    enabled: !!categorySlug && categorySlug !== 'undefined',
    queryFn: async () => {
      if (!categorySlug || categorySlug === 'undefined') return [];
      const res = await apiClient.get(`/content/categories/${categorySlug}/activities/`);
      // Some endpoints return array, some return {results: array}
      if (Array.isArray(res.data)) return res.data;
      return res.data?.results ?? [];
    },
  });
  console.log('Activities data:', activities);

  const filtered = difficulty
    ? activities?.filter((a: any) => a.difficulty === difficulty)
    : activities;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/parent">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/parent/child/$childId/categories" params={{ childId }}>Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Activities</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold mb-8">Activities</h1>
      <div className="mb-6 flex gap-4 items-center">
        <label className="font-medium">Filter by difficulty:</label>
        <select
          className="border rounded px-3 py-1"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered?.length === 0 && (
          <div className="col-span-full text-muted-foreground">No activities found.</div>
        )}
        {filtered?.map((activity: any) => (
          <div
            key={activity.id}
            className="bg-card rounded-xl p-6 shadow hover:shadow-lg transition cursor-pointer border flex flex-col gap-2"
          >
            <div className="font-semibold text-lg">{activity.title}</div>
            <div className="text-muted-foreground text-sm line-clamp-2">{activity.description}</div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 rounded bg-muted text-xs">{activity.difficulty}</span>
              {activity.duration_minutes && (
                <span className="px-2 py-0.5 rounded bg-muted text-xs">{activity.duration_minutes} min</span>
              )}
            </div>
            <Link
              to="/parent/child/$childId/activity/$activityId"
              params={{ childId, activityId: activity.id }}
              className="mt-3 inline-block text-primary hover:underline font-medium"
            >
              View Activity
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryActivitiesPage;
