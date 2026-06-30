"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface Note { id: string; title: string; subject: string }
interface Card { id: string; front: string; back: string; subject: string }

export default function FlashcardsPage() {
  const { access_token } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [selectedNote, setSelectedNote] = useState("")
  const [numCards, setNumCards] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { fetchNotes(); fetchCards() }, [])

  const fetchNotes = async () => {
    const res = await api.get(`/notes/?token=${access_token}`)
    setNotes(res.data)
  }

  const fetchCards = async () => {
    const res = await api.get(`/flashcards/?token=${access_token}`)
    setCards(res.data)
  }

  const generateCards = async () => {
    if (!selectedNote) { setError("Please select a note!"); return }
    setGenerating(true)
    setError("")
    try {
      await api.post(`/flashcards/generate?token=${access_token}`, {
        note_id: selectedNote,
        num_cards: numCards
      })
      await fetchCards()
      setCurrentIdx(0)
      setFlipped(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate flashcards")
    } finally {
      setGenerating(false)
    }
  }

  const nextCard = () => {
    setFlipped(false)
    setCurrentIdx((i) => (i + 1) % cards.length)
  }
  const prevCard = () => {
    setFlipped(false)
    setCurrentIdx((i) => (i - 1 + cards.length) % cards.length)
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 6px" }}>
          Flashcards 🃏
        </h1>
        <p style={{ color: "#6b7280", margin: 0 }}>AI-generated flashcards from your notes!</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "24px" }}>

        {/* Generate Form */}
        <div style={{
          background: "white", borderRadius: "16px", padding: "24px",
          border: "1px solid #f3f4f6", height: "fit-content"
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a2e", margin: "0 0 20px" }}>
            Generate Flashcards 🤖
          </h2>
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Select Note
            </label>
            <select value={selectedNote} onChange={(e) => setSelectedNote(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "14px", background: "white" }}>
              <option value="">Choose a note...</option>
              {notes.map((n) => <option key={n.id} value={n.id}>{n.title} — {n.subject}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
              Number of Cards: {numCards}
            </label>
            <input type="range" min="5" max="20" value={numCards}
              onChange={(e) => setNumCards(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <button onClick={generateCards} disabled={generating}
            style={{
              width: "100%", padding: "12px",
              background: generating ? "#a0aec0" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600",
              cursor: generating ? "not-allowed" : "pointer"
            }}>
            {generating ? "🤖 Generating..." : "Generate Flashcards 🚀"}
          </button>
        </div>

        {/* Card Viewer */}
        <div>
          {cards.length === 0 ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "60px", textAlign: "center", border: "1px solid #f3f4f6" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🃏</div>
              <p style={{ color: "#9ca3af" }}>No flashcards yet — generate your first set!</p>
            </div>
          ) : (
            <>
              <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "12px", fontSize: "14px" }}>
                Card {currentIdx + 1} of {cards.length}
              </p>
              <div
                onClick={() => setFlipped(!flipped)}
                style={{
                  background: flipped
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "white",
                  borderRadius: "20px",
                  padding: "60px 40px",
                  minHeight: "280px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  border: "1px solid #f3f4f6",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s"
                }}
              >
                <p style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: flipped ? "white" : "#1a1a2e",
                  margin: 0,
                  lineHeight: "1.6"
                }}>
                  {flipped ? cards[currentIdx].back : cards[currentIdx].front}
                </p>
              </div>
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", margin: "12px 0 20px" }}>
                {flipped ? "Click to see question" : "Click to flip card"}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button onClick={prevCard} style={{
                  padding: "10px 24px", background: "white", border: "2px solid #e5e7eb",
                  borderRadius: "10px", cursor: "pointer", fontWeight: "600", color: "#374151"
                }}>← Previous</button>
                <button onClick={nextCard} style={{
                  padding: "10px 24px", background: "linear-gradient(135deg, #667eea, #764ba2)",
                  color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600"
                }}>Next →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}