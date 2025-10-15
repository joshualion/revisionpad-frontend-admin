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
