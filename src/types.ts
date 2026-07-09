export type TaskStatus = "todo" | "in_progress" | "done"
export type TaskPriority = "low" | "medium" | "high"

export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

export interface Image {
  id: number
  title: string
  image_url?: string
  created_at?: string
}

export interface Annotation {
  id: number
  image: number
  polygons: number[][]
  label: string
  created_at?: string
}
