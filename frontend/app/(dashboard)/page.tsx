"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { useRouter } from "next/navigation"

interface DashboardStats {
  notes_count: number
  quizzes_done: number
  exam_readiness: number
  flashcards_count: number
  pending_tasks: number
  study_hours_week: number
  quiz_history: { date: string; score: number }[]
}

export default function DashboardPage() {
  const { user, access_token } = useAuthStore()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, notesRes] = await Promise.all([
        api.get(`/analytics/dashboard?token=${access_token}`),
        api.get(`/notes/?token=${access_token}`)
      ])
      setStats(statsRes.data)
      setRecentNotes(notesRes.data.slice(0, 3))
    } catch (err) {
      console.error("Failed to fetch dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Study Hours", value: stats?.study_hours_week ?? 0, unit: "this week",
      icon: "⏱️", color: "#eff6ff", text: "#1d4ed8", href: "/dashboard/analytics"
    },
    {
      label: "Quizzes Done", value: stats?.quizzes_done ?? 0, unit: "total",
      icon: "✅", color: "#f0fdf4", text: "#15803d", href: "/dashboard/quiz"
    },
    {
      label: "Notes Uploaded", value: stats?.notes_count ?? 0, unit: "documents",
      icon: "📝", color: "#faf5ff", text: "#7e22ce", href: "/dashboard/notes"
    },
    {
      label: "Exam Readiness", value: `${stats?.exam_readiness ?? 0}%`, unit: "avg score",
      icon: "🎯", color: "#fff7ed", text: "#c2410c", href: "/dashboard/analytics"
    },
  ]

  const quickActions = [
    { label: "Upload Notes", icon: "📤", href: "/dashboard/notes", grad: "linear-gradient(135deg, #667eea, #764ba2)" },
    { label: "Take Quiz", icon: "❓", href: "/dashboard/quiz", grad: "linear-gradient(135deg, #f093fb, #f5576c)" },
    { label: "Flashcards", icon: "🃏", href: "/dashboard/flashcards", grad: "linear-gradient(135deg, #4facfe, #00f2fe)" },
    { label: "AI Tutor", icon: "🤖", href: "/dashboard/chat", grad: "linear-gradient(135deg, #43e97b, #38f9d7)" },
  ]

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Welcome */}
      <div style={{
        marginBottom: "28px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(10px)",
        transition: "all 0.5s ease"
      }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          Good morning, {user?.name}! 👋
        </h1>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "15px" }}>
          {stats && stats.pending_tasks > 0
            ? `You have ${stats.pending_tasks} pending task${stats.pending_tasks > 1 ? "s" : ""} — let's get to it!`
            : "Ready to study smarter today?"}
        </p>
      </div>

      {/* Stats Cards — CLICKABLE + ANIMATED */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            onClick={() => router.push(stat.href)}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1px solid #f3f4f6",
              cursor: "pointer",
              transition: "all 0.25s ease",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(15px)",
              transitionDelay: `${i * 70}ms`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)"
              e.currentTarget.style.borderColor = stat.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"
              e.currentTarget.style.borderColor = "#f3f4f6"
            }}
          >
            <div style={{
              width: "44px", height: "44px", background: stat.color,
              borderRadius: "12px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", marginBottom: "12px"
            }}>{stat.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: "700", color: "#1a1a2e", lineHeight: 1 }}>
              {loading ? "—" : stat.value}
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginTop: "6px" }}>
              {stat.label}
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
              {stat.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions — CLICKABLE + COLORED GRADIENT ICONS */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 16px" }}>
          Quick Actions
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px"
        }}>
          {quickActions.map((action, i) => (
            <div
              key={action.label}
              onClick={() => router.push(action.href)}
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "24px 16px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                border: "1px solid #f3f4f6",
                cursor: "pointer",
                transition: "all 0.25s ease",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.92)",
                transitionDelay: `${300 + i * 70}ms`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)"
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"
              }}
            >
              <div style={{
                width: "52px", height: "52px",
                background: action.grad,
                borderRadius: "14px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "26px", margin: "0 auto 12px"
              }}>{action.icon}</div>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                {action.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity — NOW SHOWS REAL NOTES */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        border: "1px solid #f3f4f6"
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "16px"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a2e", margin: 0 }}>
            Recent Notes
          </h2>
          {recentNotes.length > 0 && (
            <span
              onClick={() => router.push("/dashboard/notes")}
              style={{ fontSize: "13px", color: "#667eea", fontWeight: "600", cursor: "pointer" }}
            >
              View all →
            </span>
          )}
        </div>

        {!loading && recentNotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span style={{ fontSize: "48px" }}>📚</span>
            <p style={{ color: "#9ca3af", margin: "12px 0 20px" }}>
              No activity yet — start studying!
            </p>
            <button
              onClick={() => router.push("/dashboard/notes")}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", padding: "12px 28px", borderRadius: "10px",
                border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer"
              }}
            >
              Upload Your First Notes 📤
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => router.push("/dashboard/notes")}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 16px", borderRadius: "12px", background: "#f8f9fa",
                  cursor: "pointer", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f5"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f8f9fa"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>📝</span>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                      {note.title}
                    </p>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{note.subject}</span>
                  </div>
                </div>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}