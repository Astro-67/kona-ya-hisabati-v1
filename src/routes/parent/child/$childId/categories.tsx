
// eslint-disable-next-line import/no-duplicates
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
// eslint-disable-next-line import/no-duplicates
import { Link } from '@tanstack/react-router';
import { apiClient } from '@/lib/api';
import { CategoryCard } from '@/components/parent/category-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// const parentChildRoute = getRouteApi('/parent/child/$childId');

export const Route = createFileRoute('/parent/child/$childId/categories')({
  component: CategoriesPage,
});

function CategoriesPage() {
  let { childId } = Route.useParams();
  childId = String(childId);
  const [, setChildName] = useState<string | null>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/content/categories/');
      return response.data;
    },
  });

  // Fetch child name for breadcrumb
  useEffect(() => {
    if (!childId || childId === 'undefined') {
      setChildName(null);
      return;
    }
    (async () => {
      try {
        const res = await apiClient.get(`/parent/children/${childId}/`);
        setChildName(res.data?.name || null);
      } catch {
        setChildName(null);
      }
    })();
  }, [childId]);

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
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-3xl font-bold mb-8">Choose a Topic</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(categories?.results ?? []).slice(0, 6).map((category: any, idx: number) => {
          // Defensive: only pass valid childId
          if (!childId || childId === '' || childId === 'undefined') return null;
          return <CategoryCard key={category.id} category={category} childId={childId} index={idx} />;
        })}
      </div>
    </div>
  );
}

export default CategoriesPage;
