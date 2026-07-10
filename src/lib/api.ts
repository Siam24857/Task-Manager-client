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

// Add token to requests from localStorage
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh: refreshToken
          })
          if (response.data.access) {
            localStorage.setItem('access_token', response.data.access)
            if (response.data.refresh) {
              localStorage.setItem('refresh_token', response.data.refresh)
            }
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
