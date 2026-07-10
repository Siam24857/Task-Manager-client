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
  withCredentials: true, // Enable cookie-based authentication
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // Call refresh endpoint - cookies are automatically sent with withCredentials
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        })
        return api(originalRequest)
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
