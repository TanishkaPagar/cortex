"use client"
import { useAuthStore } from "@/store/authStore"

export default function TopBar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-40">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full">
          <span>🔥</span>
          <span className="text-orange-600 text-sm font-medium">
            {user?.streak} day streak
          </span>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full">
          <span>⚡</span>
          <span className="text-blue-600 text-sm font-medium">
            {user?.xp} XP
          </span>
        </div>
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}