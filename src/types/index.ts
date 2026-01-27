export type UserRole = 'parent' | 'teacher' | 'student';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export interface Parent extends User {
  phone?: string;
}

export interface Teacher extends User {
  school_name?: string;
  subject?: string;
}

export interface Student extends User {
  date_of_birth?: string;
  grade_level?: string;
  parent_id?: number;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  category: number;
  difficulty: 'easy' | 'medium' | 'hard';
  duration_minutes?: number;
  is_featured: boolean;
}

export interface Question {
  id: number;
  activity: number;
  question_text: string;
  question_type: 'multiple_choice' | 'drag_drop' | 'fill_blank' | 'image_select';
  correct_answer: string;
  options?: Array<string>;
  order: number;
}

export interface Progress {
  id: number;
  student: number;
  activity: number;
  completed: boolean;
  score?: number;
  time_spent?: number;
  attempts: number;
  last_attempt?: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon?: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface Class {
  id: number;
  name: string;
  teacher: number;
  grade_level: string;
  student_count?: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  class_id: number;
  teacher: number;
  activities: Array<number>;
  due_date?: string;
  status: 'active' | 'completed' | 'overdue';
}

export interface LessonPlan {
  id: number;
  title: string;
  description: string;
  teacher: number;
  grade_level: string;
  subject: string;
  duration_minutes?: number;
  objectives?: string;
  materials?: string;
  activities: Array<number>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, Array<string>>;
}

export interface ParentGuideCategoryDetail {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

export type ParentGuideType =
  | 'learning_tips'
  | 'activity_ideas'
  | 'progress_help'
  | 'motivation'
  | 'development'
  | 'homework_help';

export type ParentGuideResourceType =
  | 'text_guide'
  | 'video_tutorial'
  | 'offline_activity';

export type ParentGuideAgeGroup =
  | 'pre_primary'
  | 'standard_1'
  | 'standard_2'
  | 'all';

export interface ParentGuide {
  id: number;
  title: string;
  description: string;
  content: string;
  category: number;
  category_detail: ParentGuideCategoryDetail;
  guide_type: ParentGuideType;
  resource_type: ParentGuideResourceType;
  age_group: ParentGuideAgeGroup;
  thumbnail: string;
  video_url: string;
  icon: string;
  materials_needed: string;
  duration_minutes: number;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<T>;
}
