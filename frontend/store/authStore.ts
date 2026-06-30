import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  name: string
  email: string
  xp: number
  level: string
  streak: number
  avatar_url?: string
}

interface AuthStore {
  user: User | null
  access_token: string | null
  refresh_token: string | null
  isLoggedIn: boolean
  setAuth: (user: User, access_token: string, refresh_token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      isLoggedIn: false,
      setAuth: (user, access_token, refresh_token) =>
        set({ user, access_token, refresh_token, isLoggedIn: true }),
      logout: () =>
        set({ user: null, access_token: null, refresh_token: null, isLoggedIn: false }),
    }),
    { name: "auth-storage" }
  )
)