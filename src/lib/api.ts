import axios from 'axios'

const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (isLocalHost ? 'http://localhost:8000' : 'https://task-manager-servers.vercel.app')

const normalizedBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`

export const API_BASE_URL = normalizedBaseUrl

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('auth-storage')
        if (raw) {
          const parsed = JSON.parse(raw)
          const token = parsed?.state?.token
          if (token) {
            config.headers.Authorization = `Token ${token}`
          }
        }
      } catch {
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api
