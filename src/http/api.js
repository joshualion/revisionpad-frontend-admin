import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// Create Axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
   headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});
// Automatically attach token
api.interceptors.request.use(config => {
  const auth = useAuthStore()
  const token = auth.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

// Global response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        const auth = useAuthStore()
        await auth.logout()
      } catch {}
      // Hard redirect to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
