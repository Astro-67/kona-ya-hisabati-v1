"use client";

import React from "react";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export interface Category {
  slug: string | number;
  id: number | string;
  name: string;
  icon?: ReactNode | string;
  description?: string;
  activity_count?: number;
}

// Kids color palette matching our theme
const cardThemes = [
  {
    bg: "bg-[#E3F2FD]",
    accent: "bg-kids-blue",
    iconBg: "bg-kids-blue/20",
    text: "text-kids-blue",
    border: "border-kids-blue/30",
    hoverShadow: "hover:shadow-[0_8px_30px_-5px_rgba(30,136,229,0.3)]",
  },
  {
    bg: "bg-[#FFF8E1]",
    accent: "bg-kids-yellow",
    iconBg: "bg-kids-yellow/30",
    text: "text-[#F9A825]",
    border: "border-kids-yellow/50",
    hoverShadow: "hover:shadow-[0_8px_30px_-5px_rgba(253,216,53,0.4)]",
  },
  {
    bg: "bg-[#E8F5E9]",
    accent: "bg-kids-green",
    iconBg: "bg-kids-green/20",
    text: "text-kids-green",
    border: "border-kids-green/30",
    hoverShadow: "hover:shadow-[0_8px_30px_-5px_rgba(67,160,71,0.3)]",
  },
  {
    bg: "bg-[#FFF3E0]",
    accent: "bg-kids-orange",
    iconBg: "bg-kids-orange/20",
    text: "text-kids-orange",
    border: "border-kids-orange/30",
    hoverShadow: "hover:shadow-[0_8px_30px_-5px_rgba(251,140,0,0.3)]",
  },
  {
    bg: "bg-[#FCE4EC]",
    accent: "bg-kids-pink",
    iconBg: "bg-kids-pink/20",
    text: "text-kids-pink",
    border: "border-kids-pink/30",
    hoverShadow: "hover:shadow-[0_8px_30px_-5px_rgba(233,30,99,0.3)]",
  },
  {
    bg: "bg-[#E8EAF6]",
    accent: "bg-[#5C6BC0]",
    iconBg: "bg-[#5C6BC0]/20",
    text: "text-[#5C6BC0]",
    border: "border-[#5C6BC0]/30",
    hoverShadow: "hover:shadow-[0_8px_30px_-5px_rgba(92,107,192,0.3)]",
  },
];

// Default category icons based on common category names
const getCategoryIcon = (name: string, icon?: ReactNode | string) => {
  if (icon && typeof icon === "string") return icon;
  if (icon) return icon;

  const nameLower = name.toLowerCase();
  if (nameLower.includes("math")) return "🔢";
  if (nameLower.includes("science")) return "🔬";
  if (nameLower.includes("read") || nameLower.includes("english")) return "📖";
  if (nameLower.includes("art") || nameLower.includes("draw")) return "🎨";
  if (nameLower.includes("music")) return "🎵";
  if (nameLower.includes("sport") || nameLower.includes("physical")) return "⚽";
  if (nameLower.includes("history")) return "🏛️";
  if (nameLower.includes("geography") || nameLower.includes("world")) return "🌍";
  if (nameLower.includes("animal") || nameLower.includes("nature")) return "🦁";
  if (nameLower.includes("space") || nameLower.includes("astro")) return "🚀";
  return "📚";
};

interface CategoryCardProps {
  category: Category;
  childId: string | number;
  index?: number;
  onClick?: () => void;
}

export function CategoryCard({
  category,
  childId,
  index = 0,
  onClick,
}: CategoryCardProps) {
  const theme = cardThemes[index % cardThemes.length];
  const safeChildId = String(childId);
  const safeSlug = String(category.slug);
  const categoryIcon = getCategoryIcon(category.name, category.icon);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (safeChildId && safeSlug && safeChildId !== "" && safeSlug !== "") {
      window.location.href = `/parent/child/${safeChildId}/category/${safeSlug}`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      className={`
        relative cursor-pointer overflow-hidden
        ${theme.bg} ${theme.border} border-2
        rounded-2xl p-0
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        ${theme.hoverShadow}
        group
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Go to ${category.name}`}
    >
      {/* Decorative accent bar */}
      <div className={`h-2 w-full ${theme.accent}`} />

      {/* Sparkle decoration */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className={`w-5 h-5 ${theme.text}`} />
      </div>

      <div className="p-6">
        {/* Icon container */}
        <div
          className={`
            w-20 h-20 rounded-2xl ${theme.iconBg}
            flex items-center justify-center
            mb-4 mx-auto
            transition-transform duration-300
            group-hover:scale-110 group-hover:rotate-3
          `}
        >
          <span className="text-5xl" role="img" aria-hidden="true">
            {categoryIcon}
          </span>
        </div>

        {/* Category name */}
        <h3
          className={`
            font-bold text-xl text-center mb-2
            text-foreground
            transition-colors duration-200
          `}
        >
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="text-muted-foreground text-sm text-center line-clamp-2 mb-4">
            {category.description}
          </p>
        )}

        {/* Activity count badge */}
        {category.activity_count !== undefined && (
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <BookOpen className={`w-4 h-4 ${theme.text}`} />
            <span className={`text-sm font-semibold ${theme.text}`}>
              {category.activity_count} {category.activity_count === 1 ? "Activity" : "Activities"}
            </span>
          </div>
        )}

        {/* Explore button */}
        <div
          className={`
            flex items-center justify-center gap-2
            py-2.5 px-4 rounded-xl
            ${theme.accent} 
            text-white font-semibold text-sm
            transition-all duration-200
            group-hover:gap-3
          `}
        >
          <span>Explore</span>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  );
}
