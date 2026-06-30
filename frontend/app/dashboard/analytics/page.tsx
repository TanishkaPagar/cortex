"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface DashboardStats {
  notes_count: number
  quizzes_done: number
  exam_readiness: number
  flashcards_count: number
  pending_tasks: number
  study_hours_week: number
  quiz_history: { date: string; score: number }[]
}

export default function AnalyticsPage() {
  const { access_token, user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get(`/analytics/dashboard?token=${access_token}`)
      setStats(res.data)
    } catch (err) {
      console.error("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ color: "#6b7280" }}>Loading analytics...</p>
      </div>
    )
  }

  const maxScore = stats?.quiz_history.length
    ? Math.max(...stats.quiz_history.map(q => q.score), 100)
    : 100

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          Analytics 📊
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Track your learning progress and performance
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        {[
          { label: "Notes Uploaded", value: stats?.notes_count ?? 0, icon: "📝", color: "#eff6ff", text: "#1d4ed8" },
          { label: "Quizzes Completed", value: stats?.quizzes_done ?? 0, icon: "✅", color: "#f0fdf4", text: "#15803d" },
          { label: "Exam Readiness", value: `${stats?.exam_readiness ?? 0}%`, icon: "🎯", color: "#fff7ed", text: "#c2410c" },
          { label: "Flashcards", value: stats?.flashcards_count ?? 0, icon: "🃏", color: "#faf5ff", text: "#7e22ce" },
          { label: "Pending Tasks", value: stats?.pending_tasks ?? 0, icon: "📋", color: "#fef2f2", text: "#dc2626" },
          { label: "Current XP", value: user?.xp ?? 0, icon: "⚡", color: "#fefce8", text: "#a16207" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "white", borderRadius: "16px", padding: "20px",
            border: "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>
            <div style={{
              width: "44px", height: "44px", background: stat.color,
              borderRadius: "12px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "22px", marginBottom: "12px"
            }}>{stat.icon}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: "#1a1a2e" }}>{stat.value}</div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quiz Performance Chart */}
      <div style={{
        background: "white", borderRadius: "16px", padding: "28px",
        border: "1px solid #f3f4f6", marginBottom: "24px"
      }}>
        <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 24px" }}>
          📈 Quiz Performance History
        </h2>

        {!stats?.quiz_history.length ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "36px", marginBottom: "8px" }}>📊</div>
            <p style={{ color: "#9ca3af", margin: 0, fontSize: "14px" }}>
              Take quizzes to see your performance trend here!
            </p>
          </div>
        ) : (
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "12px",
            height: "200px",
            paddingTop: "20px"
          }}>
            {stats.quiz_history.map((item, i) => (
              <div key={i} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", gap: "8px"
              }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#1a1a2e" }}>
                  {item.score}%
                </span>
                <div style={{
                  width: "100%",
                  height: `${(item.score / maxScore) * 140}px`,
                  background: item.score >= 80
                    ? "linear-gradient(180deg, #4ade80, #15803d)"
                    : item.score >= 60
                    ? "linear-gradient(180deg, #fbbf24, #d97706)"
                    : "linear-gradient(180deg, #f87171, #dc2626)",
                  borderRadius: "8px 8px 0 0",
                  minHeight: "10px",
                  transition: "height 0.5s"
                }} />
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{item.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Insights Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "16px", padding: "24px", color: "white"
        }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "16px", fontWeight: "600" }}>
            💡 Study Insight
          </h3>
          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.6", opacity: 0.9 }}>
            {stats && stats.exam_readiness >= 80
              ? "Excellent work! You're exam ready. Keep reviewing flashcards to maintain your edge!"
              : stats && stats.exam_readiness >= 50
              ? "You're making good progress! Try taking more quizzes to boost your readiness score."
              : "Get started by uploading notes and taking quizzes to build your study profile!"}
          </p>
        </div>

        <div style={{
          background: "white", borderRadius: "16px", padding: "24px",
          border: "1px solid #f3f4f6"
        }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "600", color: "#1a1a2e" }}>
            🎯 Quick Stats
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Average Quiz Score</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>
                {stats?.exam_readiness ?? 0}%
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Materials Studied</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>
                {stats?.notes_count ?? 0} notes
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>Active Streak</span>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>
                {user?.streak ?? 0} days 🔥
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}