
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ChevronRight, Clock, HelpCircle, Sparkles, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { apiClient } from '@/lib/api';

export const Route = createFileRoute('/parent/child/$childId/category/$categorySlug')({
  component: CategoryActivitiesPage,
});

function CategoryActivitiesPage() {
  let { childId, categorySlug } = Route.useParams();
  childId = String(childId);
  categorySlug = String(categorySlug);
  const [difficulty, setDifficulty] = useState('');

  const navigate = useNavigate();

  const { data: activities } = useQuery({
    queryKey: ['category-activities', childId, categorySlug],
    enabled: !!childId && childId !== 'undefined' && !!categorySlug && categorySlug !== 'undefined',
    queryFn: async () => {
      if (!childId || childId === 'undefined' || !categorySlug || categorySlug === 'undefined') return [];
      const res = await apiClient.get(`/content/categories/${categorySlug}/activities/`);
      // Some endpoints return array, some return {results: array}
      if (Array.isArray(res.data)) return res.data;
      return res.data?.results ?? [];
    },
  });

  // Normalize and filter activities (support both `difficulty` and `difficulty_level` fields)
  const normalizedActivities = (activities ?? []).map((a: any) => ({
    ...a,
    difficulty_level: a.difficulty_level ?? a.difficulty ?? 'unknown',
    expected_duration: a.expected_duration ?? a.duration_minutes ?? a.duration ?? 0,
  }));

  const filtered = difficulty && difficulty !== 'all'
    ? normalizedActivities.filter((a: any) => a.difficulty_level === difficulty)
    : normalizedActivities;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
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
              <BreadcrumbPage>{categorySlug}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">{categorySlug}</h1>
          <p className="text-muted-foreground text-lg font-medium">Choose an activity to play with your child</p>
        </div>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap gap-4 items-center p-4 bg-card rounded-2xl border-2 border-border shadow-sm">
          <div className="flex items-center gap-3">
            <label className="font-bold text-sm text-foreground">Filter by difficulty:</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-40 rounded-xl border-2 font-semibold">
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="font-medium">All levels</SelectItem>
                <SelectItem value="easy" className="font-medium">Easy</SelectItem>
                <SelectItem value="medium" className="font-medium">Medium</SelectItem>
                <SelectItem value="hard" className="font-medium">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto text-sm font-semibold text-muted-foreground">{filtered.length} {filtered.length === 1 ? "activity" : "activities"} found</div>
        </div>

        {/* Activities Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <div className="text-5xl mb-4">?</div>
              <p className="text-lg font-bold">No activities found</p>
              <p className="text-sm font-medium">Try adjusting your filters</p>
            </div>
          )}

          {filtered.map((activity: any, index: number) => {
            const difficultyStyles = (() => {
              if (!activity) return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: "bg-muted" };
              switch (activity.difficulty_level) {
                case "easy":
                  return { bg: "bg-kids-green/10", text: "text-kids-green", border: "border-kids-green/30", icon: "bg-kids-green" };
                case "medium":
                  return { bg: "bg-kids-orange/10", text: "text-kids-orange", border: "border-kids-orange/30", icon: "bg-kids-orange" };
                case "hard":
                  return { bg: "bg-kids-pink/10", text: "text-kids-pink", border: "border-kids-pink/30", icon: "bg-kids-pink" };
                default:
                  return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: "bg-muted" };
              }
            })();

            return (
              <Card key={activity.id} className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-t-4 ${getCardAccent(index)} rounded-2xl`}>
                <CardContent className="p-5 space-y-4">
                  {/* Title & Featured Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">{activity.title}</h3>
                    {activity.is_featured && (
                      <Badge className="bg-kids-yellow text-secondary-foreground border-0 shadow-sm shrink-0 font-bold">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground text-sm font-medium line-clamp-2">{activity.description}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Difficulty */}
                    <div className={`flex items-center gap-2 p-2.5 rounded-xl ${difficultyStyles.bg} border ${difficultyStyles.border}`}>
                      <div className={`p-1.5 rounded-lg ${difficultyStyles.icon}`}>
                        <Zap className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Difficulty</p>
                        <p className={`text-sm font-bold capitalize ${difficultyStyles.text}`}>{activity.difficulty_level}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-kids-blue/10 border border-kids-blue/30">
                      <div className="p-1.5 rounded-lg bg-kids-blue">
                        <Clock className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Duration</p>
                        <p className="text-sm font-bold text-kids-blue">{activity.expected_duration} min</p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-kids-yellow/20 border border-kids-yellow/40">
                      <div className="p-1.5 rounded-lg bg-kids-yellow">
                        <Star className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Points</p>
                        <p className="text-sm font-bold text-kids-orange">{activity.points_reward} pts</p>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-kids-pink/10 border border-kids-pink/30">
                      <div className="p-1.5 rounded-lg bg-kids-pink">
                        <HelpCircle className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Questions</p>
                        <p className="text-sm font-bold text-kids-pink">{activity.question_count}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-0">
                  <Button
                    onClick={() => navigate({ to: `/parent/child/${childId}/activity/${activity.id}`, params: { childId, activityId: activity.id } })}
                    className="w-full rounded-xl font-bold text-base h-11 bg-primary hover:bg-primary/90 transition-all group-hover:shadow-md"
                  >
                    Start Activity
                    <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Helpers
  function getCardAccent(index: number) {
    const accents = [
      'border-t-kids-blue',
      'border-t-kids-green',
      'border-t-kids-orange',
      'border-t-kids-pink',
      'border-t-kids-yellow',
    ];
    return accents[index % accents.length];
  }
}

export default CategoryActivitiesPage;
