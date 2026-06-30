import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const storage = localStorage.getItem("auth-storage")
  if (storage) {
    const { state } = JSON.parse(storage)
    if (state?.access_token) {
      config.headers.Authorization = `Bearer ${state.access_token}`
    }
  }
  return config
})

export default api