"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await api.post("/auth/register", form)
      setAuth(res.data.user, res.data.access_token, res.data.refresh_token)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "28px"
          }}>🎓</div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a1a2e",
            margin: "0 0 8px"
          }}>Join Cortex</h1>
          <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
            Start your AI-powered study journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#fff5f5",
            border: "1px solid #fed7d7",
            color: "#c53030",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "14px"
          }}>{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px"
            }}>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px"
            }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "6px"
            }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "#a0aec0"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s"
            }}
          >
            {loading ? "Creating account..." : "Create Account 🚀"}
          </button>
        </form>

        {/* Login link */}
        <p style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          color: "#666"
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{
            color: "#667eea",
            fontWeight: "600",
            textDecoration: "none"
          }}>Login here</Link>
        </p>
      </div>
    </div>
  )
}