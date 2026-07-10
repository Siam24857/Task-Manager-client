import axios from 'axios'

const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (isLocalHost ? 'http://localhost:8000' : 'https://task-manager-server-git-main-sheik-saims-projects.vercel.app')

const normalizedBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`

export const API_BASE_URL = normalizedBaseUrl

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
        const refreshToken = typeof window !== 'undefined' ? window.localStorage.getItem('refresh_token') : null
        const response = await axios.post(`${API_BASE_URL}/auth/login/refresh/`, {
          refresh: refreshToken,
        })
        const { access } = response.data
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('access_token', access)
        }
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem('access_token')
          window.localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
