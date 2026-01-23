import { useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

export interface Category {
  slug: string | number;
  id: number | string;
  name: string;
  icon?: ReactNode | string;
  description?: string;
}

// Color palette for cards
const cardColors = [
  'bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-50',
  'bg-gradient-to-br from-pink-200 via-pink-100 to-pink-50',
  'bg-gradient-to-br from-blue-200 via-blue-100 to-blue-50',
  'bg-gradient-to-br from-green-200 via-green-100 to-green-50',
  'bg-gradient-to-br from-purple-200 via-purple-100 to-purple-50',
  'bg-gradient-to-br from-orange-200 via-orange-100 to-orange-50',
];

export function CategoryCard({ category, childId, index = 0 }: { category: Category; childId: string | number; index?: number }) {
  const navigate = useNavigate();
  const colorClass = cardColors[index % cardColors.length];
  const safeChildId = String(childId);
  const safeSlug = String(category.slug);
  return (
    <Card
      className={`cursor-pointer hover:shadow-xl transition p-6 flex flex-col items-center text-center rounded-xl border-0 ${colorClass}`}
      onClick={() => {
        if (safeChildId && safeSlug && safeChildId !== '' && safeSlug !== '') {
          navigate({
            to: `/parent/child/${safeChildId}/category/${safeSlug}`,
            params: { childId: safeChildId, categorySlug: safeSlug },
          });
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Go to ${category.name}`}
    >
      <div className="mb-4 text-5xl">
        {typeof category.icon === 'string' ? category.icon : category.icon || '📚'}
      </div>
      <div className="font-bold text-lg mb-1 text-foreground drop-shadow-sm">{category.name}</div>
      {category.description && <div className="text-muted-foreground text-sm line-clamp-2">{category.description}</div>}
    </Card>
  );
}
