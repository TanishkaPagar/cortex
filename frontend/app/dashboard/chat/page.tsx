"use client"
import { useState, useEffect, useRef } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Note {
  id: string
  title: string
  subject: string
}

export default function ChatPage() {
  const { access_token } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI Study Tutor! 🎓 Ask me anything about your notes or any topic you're studying. I'm here to help!"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes/?token=${access_token}`)
      setNotes(res.data)
    } catch (err) {
      console.error("Failed to fetch notes")
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")

    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage }
    ]
    setMessages(newMessages)
    setLoading(true)

    try {
      // Build chat history for context
      const chatHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await api.post(
        `/chat/ask?token=${access_token}`,
        {
          question: userMessage,
          note_id: selectedNote || null,
          chat_history: chatHistory
        }
      )

      setMessages([
        ...newMessages,
        { role: "assistant", content: res.data.answer }
      ])
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I had trouble answering that. Please try again!"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      height: "calc(100vh - 64px)",
      display: "flex",
      flexDirection: "column"
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
      }}>
        <div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a1a2e",
            margin: "0 0 4px"
          }}>AI Study Tutor 🤖</h1>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
            Ask anything — your personal AI tutor is here!
          </p>
        </div>

        {/* Note selector */}
        <div>
          <select
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
            style={{
              padding: "8px 14px",
              border: "2px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              background: "white",
              color: "#374151"
            }}
          >
            <option value="">💬 General Chat</option>
            {notes.map((note) => (
              <option key={note.id} value={note.id}>
                📝 {note.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Window */}
      <div style={{
        flex: 1,
        background: "white",
        borderRadius: "16px",
        border: "1px solid #f3f4f6",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "12px",
                alignItems: "flex-start"
              }}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0
                }}>🤖</div>
              )}

              {/* Message Bubble */}
              <div style={{
                maxWidth: "70%",
                padding: "14px 18px",
                borderRadius: msg.role === "user"
                  ? "18px 18px 4px 18px"
                  : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #667eea, #764ba2)"
                  : "#f8f9fa",
                color: msg.role === "user" ? "white" : "#1a1a2e",
                fontSize: "15px",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
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
                  fontSize: "14px",
                  flexShrink: 0
                }}>T</div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px"
              }}>🤖</div>
              <div style={{
                background: "#f8f9fa",
                padding: "14px 18px",
                borderRadius: "18px 18px 18px 4px",
                color: "#6b7280",
                fontSize: "15px"
              }}>
                Thinking... ✨
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div style={{
            padding: "0 24px 16px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap"
          }}>
            {[
              "Explain this topic simply",
              "Give me key points to remember",
              "What are common exam questions?",
              "Create a study plan for me"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                style={{
                  padding: "6px 14px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                  borderRadius: "20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          gap: "12px",
          alignItems: "flex-end"
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask your AI tutor anything... (Press Enter to send)"
            rows={1}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "15px",
              outline: "none",
              resize: "none",
              fontFamily: "'Segoe UI', sans-serif",
              lineHeight: "1.5"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: "48px",
              height: "48px",
              background: !input.trim() || loading
                ? "#e5e7eb"
                : "linear-gradient(135deg, #667eea, #764ba2)",
              color: !input.trim() || loading ? "#9ca3af" : "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "20px",
              cursor: !input.trim() || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            🚀
          </button>
        </div>
      </div>
    </div>
  )
}