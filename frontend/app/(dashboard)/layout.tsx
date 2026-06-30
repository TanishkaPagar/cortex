"use client"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/notes", icon: "📝", label: "My Notes" },
  { href: "/dashboard/quiz", icon: "❓", label: "Quizzes" },
  { href: "/dashboard/flashcards", icon: "🃏", label: "Flashcards" },
  { href: "/dashboard/planner", icon: "📅", label: "Planner" },
  { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
  { href: "/dashboard/chat", icon: "🤖", label: "AI Tutor" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoggedIn, user, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) return null

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
      background: "#f0f2f5"
    }}>

      {/* SIDEBAR */}
      <div style={{
        width: "240px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 100
      }}>

        {/* Logo */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px"
            }}>🎓</div>
            <div>
              <div style={{
                color: "white",
                fontWeight: "700",
                fontSize: "14px"
              }}>AI Study</div>
              <div style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px"
              }}>Companion</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "14px"
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{
                color: "white",
                fontSize: "13px",
                fontWeight: "600"
              }}>{user?.name}</div>
              <div style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px"
              }}>{user?.level} • {user?.xp} XP</div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "12px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  marginBottom: "4px",
                  textDecoration: "none",
                  background: isActive
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "transparent",
                  color: isActive
                    ? "white"
                    : "rgba(255,255,255,0.6)",
                  fontSize: "14px",
                  fontWeight: isActive ? "600" : "400"
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{
          padding: "12px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <button
            onClick={() => {
              logout()
              router.push("/login")
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "11px 16px",
              borderRadius: "10px",
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        marginLeft: "240px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>

        {/* Top Bar */}
        <div style={{
          height: "64px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a2e",
            margin: 0
          }}>
            {navItems.find(n => n.href === pathname)?.label || "Dashboard"}
          </h2>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#fff7ed",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              color: "#c2410c",
              fontWeight: "600"
            }}>
              🔥 {user?.streak} day streak
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#eff6ff",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              color: "#1d4ed8",
              fontWeight: "600"
            }}>
              ⚡ {user?.xp} XP
            </div>

            <div style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "700",
              fontSize: "14px"
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  )
}