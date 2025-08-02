import type { Category } from "./Category";

export type TestAssessment = {
  id: number,
  category: Category,
  description: string,
  duration_minutes: number
}