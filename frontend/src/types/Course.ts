import type { User } from "./User"

export type Course = {
  id: number,
  title: string,
  slug: string,
  category: Category,
  instructor: User,
  thumbnail: string,
  modules: Module[] ,
  is_active: boolean,
  tags: string,
  rating_count: number,
  average_rating: number,
  enrollment_count: number,
  price: string,
  learning_points: string[],
  skills: string[],
  resume_lesson_id: number,
  lesson_count: number,
  module_count: number,
  is_enrolled: boolean
}

export type EnrolledCourse = {
  course: {
    id: number,
    title: string, 
    category: string,
    thumbnail: string,
    slug: string,
    lesson_count: number,
    module_count: number,
  },
  progress: {
    percentage: number,
    lesson: number,
    module: number
  },
  resume_lesson_id: number | null,
  last_accessed_at: string,
  status?: string
}

export type ThinCourse = {
  id: number,
  title: string,
  slug: string, 
  category: string,
  average_rating: number
}

export type Category = {
  id: number,
  parent: number,
  title: string
}

export type Module = {
  id: number, 
  order?: number,
  title: string,
  description?: string,
  lessons: Lesson[]
}

export type Lesson = {
  id: number,
  title: string,
  order: number,
  is_unlocked: boolean,
  has_assessment: boolean,
  type: "ARTICLE" | "VIDEO",
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
  video_file?: string,
  content?: string,
  draft_content?: string,
  updated_at?: string
}

