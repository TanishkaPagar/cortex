"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface Note {
  id: string
  title: string
  subject: string
  summary: string
  is_processed: boolean
  created_at: string
}

export default function NotesPage() {
  const { access_token } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [form, setForm] = useState({ title: "", subject: "" })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/notes/?token=${access_token}`)
      setNotes(res.data)
    } catch (err) {
      console.error("Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setError("Please select a PDF file"); return }
    setUploading(true)
    setError("")
    setSuccess("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", form.title)
      formData.append("subject", form.subject)
      await api.post(
        `/notes/upload?token=${access_token}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      setSuccess("✅ Note uploaded and summarized by AI!")
      setForm({ title: "", subject: "" })
      setFile(null)
      fetchNotes()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#1a1a2e",
          margin: "0 0 6px"
        }}>My Notes 📝</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Upload your PDF notes and let AI summarize them!
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px"
      }}>

        {/* Upload Form */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6",
          height: "fit-content"
        }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a2e",
            margin: "0 0 20px"
          }}>Upload New Notes 📤</h2>

          {error && (
            <div style={{
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              color: "#c53030",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "14px"
            }}>{error}</div>
          )}

          {success && (
            <div style={{
              background: "#f0fff4",
              border: "1px solid #9ae6b4",
              color: "#276749",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
              fontSize: "14px"
            }}>{success}</div>
          )}

          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
              }}>Note Title</label>
              <input
                type="text"
                placeholder="e.g. Chapter 1 - Organic Chemistry"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
              }}>Subject</label>
              <input
                type="text"
                placeholder="e.g. Chemistry"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
              }}>PDF File</label>
              <div
                onClick={() => document.getElementById('file-input')?.click()}
                style={{
                  border: "2px dashed #e5e7eb",
                  borderRadius: "10px",
                  padding: "24px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: file ? "#f0fff4" : "#fafafa"
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }}
                />
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                  {file ? "✅" : "📄"}
                </div>
                <p style={{
                  color: file ? "#276749" : "#6b7280",
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: file ? "600" : "400"
                }}>
                  {file ? file.name : "Click to select PDF file"}
                </p>
                {file && (
                  <p style={{
                    color: "#9ca3af",
                    margin: "4px 0 0",
                    fontSize: "12px"
                  }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              style={{
                width: "100%",
                padding: "12px",
                background: uploading
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: uploading ? "not-allowed" : "pointer"
              }}
            >
              {uploading
                ? "🤖 AI is reading your notes..."
                : "Upload & Summarize with AI 🚀"}
            </button>
          </form>
        </div>

        {/* Notes List */}
        <div>
          <h2 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1a1a2e",
            margin: "0 0 16px"
          }}>Your Notes ({notes.length})</h2>

          {loading ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center"
            }}>
              <p style={{ color: "#6b7280" }}>Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              textAlign: "center",
              border: "1px solid #f3f4f6"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📚</div>
              <p style={{ color: "#9ca3af", margin: 0 }}>
                No notes yet — upload your first PDF!
              </p>
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(
                    selectedNote?.id === note.id ? null : note
                  )}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    border: selectedNote?.id === note.id
                      ? "2px solid #667eea"
                      : "1px solid #f3f4f6",
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "8px"
                  }}>
                    <div>
                      <h3 style={{
                        margin: "0 0 4px",
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#1a1a2e"
                      }}>{note.title}</h3>
                      <span style={{
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>{note.subject}</span>
                    </div>
                    <span style={{
                      fontSize: "12px",
                      color: "#9ca3af"
                    }}>
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {note.summary && (
                    <p style={{
                      color: "#6b7280",
                      fontSize: "13px",
                      margin: "8px 0 0",
                      lineHeight: "1.5",
                      overflow: selectedNote?.id === note.id
                        ? "visible"
                        : "hidden",
                      display: selectedNote?.id === note.id
                        ? "block"
                        : "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {note.summary}
                    </p>
                  )}

                  {selectedNote?.id === note.id && (
                    <p style={{
                      color: "#667eea",
                      fontSize: "13px",
                      margin: "12px 0 0",
                      fontWeight: "600"
                    }}>
                      Click again to collapse ▲
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}