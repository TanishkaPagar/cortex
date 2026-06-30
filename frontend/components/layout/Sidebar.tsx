"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/notes", icon: "📝", label: "My Notes" },
  { href: "/dashboard/quiz", icon: "❓", label: "Quizzes" },
  { href: "/dashboard/flashcards", icon: "🃏", label: "Flashcards" },
  { href: "/dashboard/planner", icon: "📅", label: "Planner" },
  { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
  { href: "/dashboard/chat", icon: "🤖", label: "AI Tutor" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="w-64 h-screen bg-gray-900 flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🎓</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">Cortex</h1>
            <p className="text-gray-400 text-xs">AI Study Companion</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-gray-400 text-xs">{user?.level} • {user?.xp} XP</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-all"
        >
          <span>🚪</span>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}