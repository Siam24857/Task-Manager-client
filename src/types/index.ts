export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  tags: string[]
  user: number
  created_at: string
  updated_at: string
}

export interface Image {
  id: number
  title: string
  image: string
  image_url: string
  user: number
  created_at: string
  updated_at: string
}

export interface Annotation {
  id: number
  image: number
  user: number
  polygons: number[][]
  label: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}
