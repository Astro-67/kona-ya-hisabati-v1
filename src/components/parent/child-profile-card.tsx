'use client';

import { BookOpen, Flame, Star, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface Child {
  child_id: number | string;
  child_name: string;
  total_points: number;
  total_stars: number;
  completion_rate: number;
  total_activities_completed: number;
  total_activities_attempted: number;
  current_streak: number;
  recent_activities?: Array<{
    activity_title: string;
    score: number;
    stars: number;
    completed_at: string;
  }>;
}

interface ChildProfileCardProps {
  child: Child;
  onClick?: () => void;
}

export function ChildProfileCard({ child, onClick }: ChildProfileCardProps) {
  const initials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const completionRate = Math.round(Number(child.completion_rate) || 0);
  const recentActivity = child.recent_activities?.[0];

  // Get avatar background color based on name
  const avatarColors = [
    "bg-kids-blue",
    "bg-kids-yellow",
    "bg-kids-green",
    "bg-kids-orange",
    "bg-kids-pink",
  ];
  const colorIndex =
    (child.child_name && child.child_name.length > 0 ? child.child_name.charCodeAt(0) : 0) % avatarColors.length;
  const avatarColor = avatarColors[colorIndex];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer overflow-hidden border-2 border-border bg-card transition-all duration-300",
        onClick && "hover:shadow-lg hover:-translate-y-1 hover:border-primary/50"
      )}
    >
      <CardContent className="p-0">
        {/* Header with Avatar and Name */}
        <div className="bg-linear-to-r from-kids-blue/10 to-kids-yellow/10 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-3 border-white shadow-md">
              <AvatarFallback
                className={cn(
                  avatarColor,
                  "text-lg font-bold",
                  avatarColor === "bg-kids-yellow" ? "text-foreground" : "text-white"
                )}
              >
                {initials(child.child_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">{child.child_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="h-4 w-4 text-kids-orange" />
                <span className="text-sm font-medium text-muted-foreground">{child.current_streak} day streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 p-4">
          {/* Points */}
          <div className="flex items-center gap-3 rounded-xl bg-kids-blue/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kids-blue">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Points</p>
              <p className="text-lg font-bold text-kids-blue">{child.total_points}</p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-3 rounded-xl bg-kids-yellow/20 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kids-yellow">
              <Star className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Stars</p>
              <p className="text-lg font-bold text-kids-orange">{child.total_stars}</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="flex items-center gap-3 rounded-xl bg-kids-green/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kids-green">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Completion</p>
              <p className="text-lg font-bold text-kids-green">{completionRate}%</p>
            </div>
          </div>

          {/* Activities */}
          <div className="flex items-center gap-3 rounded-xl bg-kids-pink/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kids-pink">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Activities</p>
              <p className="text-lg font-bold text-kids-pink">{child.total_activities_completed}/{child.total_activities_attempted}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity && (
          <div className="border-t border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-sm font-semibold text-foreground truncate">{recentActivity.activity_title}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="text-sm font-bold text-kids-green">{Math.round(recentActivity.score)}%</span>
                <div className="flex">
                  {[...Array(3)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < recentActivity.stars ? "text-kids-yellow fill-kids-yellow" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ChildProfileCard;