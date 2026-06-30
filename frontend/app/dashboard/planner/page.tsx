"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface Task {
  id: string
  title: string
  subject: string
  due_date: string
  priority: string
  status: string
}

export default function PlannerPage() {
  const { access_token } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [form, setForm] = useState({
    title: "", subject: "", due_date: "", priority: "medium"
  })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/planner/tasks?token=${access_token}`)
      setTasks(res.data)
    } catch (err) {
      console.error("Failed to fetch tasks")
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.due_date) {
      setError("Title and due date are required!")
      return
    }
    try {
      await api.post(`/planner/tasks?token=${access_token}`, form)
      setForm({ title: "", subject: "", due_date: "", priority: "medium" })
      setShowForm(false)
      setError("")
      fetchTasks()
    } catch (err) {
      setError("Failed to create task")
    }
  }

  const toggleStatus = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending"
    try {
      await api.patch(`/planner/tasks/${taskId}?token=${access_token}`, { status: newStatus })
      fetchTasks()
    } catch (err) {
      console.error("Failed to update task")
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await api.delete(`/planner/tasks/${taskId}?token=${access_token}`)
      fetchTasks()
    } catch (err) {
      console.error("Failed to delete task")
    }
  }

  const priorityColors: any = {
    high: { bg: "#fff5f5", text: "#dc2626", border: "#fed7d7" },
    medium: { bg: "#fff7ed", text: "#d97706", border: "#fed7aa" },
    low: { bg: "#f0fff4", text: "#15803d", border: "#9ae6b4" }
  }

  const pendingTasks = tasks.filter(t => t.status === "pending")
  const completedTasks = tasks.filter(t => t.status === "completed")

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px"
      }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
            Study Planner 📅
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Organize your assignments and deadlines
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white", border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: "600", cursor: "pointer"
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Task"}
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div style={{
          background: "white", borderRadius: "16px", padding: "24px",
          border: "1px solid #f3f4f6", marginBottom: "24px"
        }}>
          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030",
              padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px"
            }}>{error}</div>
          )}
          <form onSubmit={createTask} style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: "12px", alignItems: "end"
          }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Task Title
              </label>
              <input
                type="text" placeholder="e.g. Submit chemistry assignment"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Subject
              </label>
              <input
                type="text" placeholder="Chemistry"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Due Date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "8px", fontSize: "14px", background: "white" }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" style={{
              padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer"
            }}>
              Add Task
            </button>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Pending Tasks */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 16px" }}>
            📋 Pending ({pendingTasks.length})
          </h2>
          {pendingTasks.length === 0 ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>✨</div>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "14px" }}>All caught up! No pending tasks.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {pendingTasks.map((task) => {
                const colors = priorityColors[task.priority] || priorityColors.medium
                const isOverdue = new Date(task.due_date) < new Date(new Date().toDateString())
                return (
                  <div key={task.id} style={{
                    background: "white", borderRadius: "14px", padding: "16px",
                    border: `1px solid ${colors.border}`, display: "flex",
                    justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={() => toggleStatus(task.id, task.status)}
                        style={{
                          width: "22px", height: "22px", borderRadius: "6px",
                          border: "2px solid #d1d5db", background: "white", cursor: "pointer"
                        }}
                      />
                      <div>
                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                          {task.title}
                        </p>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{task.subject}</span>
                          <span style={{ fontSize: "12px", color: isOverdue ? "#dc2626" : "#9ca3af", fontWeight: isOverdue ? "600" : "400" }}>
                            • {isOverdue ? "Overdue! " : ""}{new Date(task.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        background: colors.bg, color: colors.text,
                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600", textTransform: "capitalize"
                      }}>{task.priority}</span>
                      <button onClick={() => deleteTask(task.id)} style={{
                        background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "16px"
                      }}>🗑️</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 16px" }}>
            ✅ Completed ({completedTasks.length})
          </h2>
          {completedTasks.length === 0 ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>📝</div>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "14px" }}>No completed tasks yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {completedTasks.map((task) => (
                <div key={task.id} style={{
                  background: "#f8f9fa", borderRadius: "14px", padding: "16px",
                  border: "1px solid #f3f4f6", display: "flex",
                  justifyContent: "space-between", alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      onClick={() => toggleStatus(task.id, task.status)}
                      style={{
                        width: "22px", height: "22px", borderRadius: "6px",
                        border: "none", background: "#15803d", color: "white",
                        cursor: "pointer", fontSize: "12px"
                      }}
                    >✓</button>
                    <p style={{
                      margin: 0, fontSize: "14px", color: "#9ca3af",
                      textDecoration: "line-through"
                    }}>{task.title}</p>
                  </div>
                  <button onClick={() => deleteTask(task.id)} style={{
                    background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "16px"
                  }}>🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}