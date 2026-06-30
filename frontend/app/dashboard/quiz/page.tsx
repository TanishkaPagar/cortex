"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface Note {
  id: string
  title: string
  subject: string
}

interface Question {
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface Quiz {
  id: string
  title: string
  subject: string
  difficulty: string
  questions: Question[]
  question_count: number
}

export default function QuizPage() {
  const { access_token } = useAuthStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedNoteId, setSelectedNoteId] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [numQuestions, setNumQuestions] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answers, setAnswers] = useState<string[]>([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchNotes()
    fetchQuizzes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes/?token=${access_token}`)
      setNotes(res.data)
    } catch (err) {
      console.error("Failed to fetch notes")
    }
  }

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/quiz/?token=${access_token}`)
      setQuizzes(res.data)
    } catch (err) {
      console.error("Failed to fetch quizzes")
    }
  }

  const generateQuiz = async () => {
    if (!selectedNoteId) {
      setError("Please select a note first!")
      return
    }
    setGenerating(true)
    setError("")
    try {
      const res = await api.post(
        `/quiz/generate?token=${access_token}`,
        {
          note_id: selectedNoteId,
          num_questions: numQuestions,
          difficulty: difficulty
        }
      )
      setActiveQuiz(res.data)
      setCurrentQ(0)
      setAnswers([])
      setShowResult(false)
      setStartTime(Date.now())
      fetchQuizzes()
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate quiz")
    } finally {
      setGenerating(false)
    }
  }

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option)
  }

  const handleNext = async () => {
    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)
    setSelectedAnswer("")

    if (currentQ + 1 < (activeQuiz?.questions.length || 0)) {
      setCurrentQ(currentQ + 1)
    } else {
      // Calculate score
      let correct = 0
      activeQuiz?.questions.forEach((q, i) => {
        if (newAnswers[i] === q.answer) correct++
      })
      const finalScore = correct / (activeQuiz?.questions.length || 1)
      setScore(correct)
      setShowResult(true)

      // Save attempt
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      try {
        await api.post(
          `/quiz/${activeQuiz?.id}/attempt?token=${access_token}`,
          {
            score: finalScore,
            correct_answers: correct,
            total_questions: activeQuiz?.questions.length,
            time_taken: timeTaken
          }
        )
      } catch (err) {
        console.error("Failed to save attempt")
      }
    }
  }

  const resetQuiz = () => {
    setActiveQuiz(null)
    setCurrentQ(0)
    setAnswers([])
    setShowResult(false)
    setScore(0)
    setSelectedAnswer("")
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
        }}>AI Quiz Generator ❓</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Generate quizzes from your notes using AI!
        </p>
      </div>

      {/* Show Quiz Result */}
      {showResult && activeQuiz && (
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          border: "1px solid #f3f4f6",
          marginBottom: "24px"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>
            {score / activeQuiz.questions.length >= 0.8 ? "🎉" :
             score / activeQuiz.questions.length >= 0.6 ? "👍" : "📚"}
          </div>
          <h2 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a2e",
            margin: "0 0 8px"
          }}>
            {score}/{activeQuiz.questions.length} Correct!
          </h2>
          <p style={{
            fontSize: "20px",
            color: score / activeQuiz.questions.length >= 0.8
              ? "#15803d"
              : score / activeQuiz.questions.length >= 0.6
              ? "#d97706"
              : "#dc2626",
            margin: "0 0 8px",
            fontWeight: "600"
          }}>
            Score: {Math.round((score / activeQuiz.questions.length) * 100)}%
          </p>
          <p style={{ color: "#6b7280", margin: "0 0 24px" }}>
            {score / activeQuiz.questions.length >= 0.8
              ? "Excellent work! You've mastered this topic! 🌟"
              : score / activeQuiz.questions.length >= 0.6
              ? "Good job! Keep studying to improve! 💪"
              : "Keep practicing — you'll get there! 📖"}
          </p>

          {/* Review Answers */}
          <div style={{ textAlign: "left", marginBottom: "24px" }}>
            {activeQuiz.questions.map((q, i) => (
              <div key={i} style={{
                background: answers[i] === q.answer ? "#f0fff4" : "#fff5f5",
                border: `1px solid ${answers[i] === q.answer ? "#9ae6b4" : "#fed7d7"}`,
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px"
              }}>
                <p style={{
                  fontWeight: "600",
                  color: "#1a1a2e",
                  margin: "0 0 8px"
                }}>
                  {answers[i] === q.answer ? "✅" : "❌"} {q.question}
                </p>
                <p style={{ color: "#6b7280", margin: "0 0 4px", fontSize: "14px" }}>
                  Your answer: {answers[i] || "Not answered"}
                </p>
                {answers[i] !== q.answer && (
                  <p style={{ color: "#15803d", margin: "0 0 4px", fontSize: "14px" }}>
                    Correct: {q.answer}
                  </p>
                )}
                <p style={{
                  color: "#6b7280",
                  margin: 0,
                  fontSize: "13px",
                  fontStyle: "italic"
                }}>
                  💡 {q.explanation}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={resetQuiz}
            style={{
              padding: "12px 32px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            Generate Another Quiz 🔄
          </button>
        </div>
      )}

      {/* Show Active Quiz */}
      {activeQuiz && !showResult && (
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          border: "1px solid #f3f4f6",
          marginBottom: "24px"
        }}>
          {/* Progress */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px"
          }}>
            <span style={{
              fontSize: "14px",
              color: "#6b7280",
              fontWeight: "600"
            }}>
              Question {currentQ + 1} of {activeQuiz.questions.length}
            </span>
            <span style={{
              background: "#eff6ff",
              color: "#1d4ed8",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600"
            }}>
              {activeQuiz.subject}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: "#f3f4f6",
            borderRadius: "10px",
            height: "8px",
            marginBottom: "28px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "10px",
              height: "100%",
              width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%`,
              transition: "width 0.3s"
            }} />
          </div>

          {/* Question */}
          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#1a1a2e",
            margin: "0 0 24px",
            lineHeight: "1.5"
          }}>
            {activeQuiz.questions[currentQ].question}
          </h2>

          {/* Options */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "24px"
          }}>
            {activeQuiz.questions[currentQ].options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                style={{
                  padding: "16px 20px",
                  background: selectedAnswer === option
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "white",
                  color: selectedAnswer === option ? "white" : "#374151",
                  border: selectedAnswer === option
                    ? "2px solid #667eea"
                    : "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "15px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontWeight: selectedAnswer === option ? "600" : "400",
                  transition: "all 0.2s"
                }}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!selectedAnswer}
            style={{
              width: "100%",
              padding: "14px",
              background: selectedAnswer
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#e5e7eb",
              color: selectedAnswer ? "white" : "#9ca3af",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: selectedAnswer ? "pointer" : "not-allowed"
            }}
          >
            {currentQ + 1 === activeQuiz.questions.length
              ? "Finish Quiz 🎯"
              : "Next Question →"}
          </button>
        </div>
      )}

      {/* Generate Quiz Form */}
      {!activeQuiz && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px"
        }}>
          {/* Generate Form */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #f3f4f6",
            height: "fit-content"
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a1a2e",
              margin: "0 0 20px"
            }}>Generate New Quiz 🤖</h2>

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

            {/* Select Note */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
              }}>Select Note</label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white"
                }}
              >
                <option value="">Choose a note...</option>
                {notes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title} — {note.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Questions */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
              }}>Number of Questions: {numQuestions}</label>
              <input
                type="range"
                min="3"
                max="10"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#9ca3af"
              }}>
                <span>3</span>
                <span>10</span>
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px"
              }}>Difficulty</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: difficulty === d
                        ? "linear-gradient(135deg, #667eea, #764ba2)"
                        : "white",
                      color: difficulty === d ? "white" : "#374151",
                      border: "2px solid",
                      borderColor: difficulty === d ? "#667eea" : "#e5e7eb",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {d === "easy" ? "😊 Easy" :
                     d === "medium" ? "🤔 Medium" : "🔥 Hard"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuiz}
              disabled={generating}
              style={{
                width: "100%",
                padding: "12px",
                background: generating
                  ? "#a0aec0"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: generating ? "not-allowed" : "pointer"
              }}
            >
              {generating
                ? "🤖 AI is generating quiz..."
                : "Generate Quiz with AI 🚀"}
            </button>
          </div>

          {/* Previous Quizzes */}
          <div>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a1a2e",
              margin: "0 0 16px"
            }}>Previous Quizzes ({quizzes.length})</h2>

            {quizzes.length === 0 ? (
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "40px",
                textAlign: "center",
                border: "1px solid #f3f4f6"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>❓</div>
                <p style={{ color: "#9ca3af", margin: 0 }}>
                  No quizzes yet — generate your first one!
                </p>
              </div>
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "1px solid #f3f4f6",
                      cursor: "pointer"
                    }}
                    onClick={async () => {
                      const res = await api.get(`/quiz/${quiz.id}?token=${access_token}`)
                      setActiveQuiz(res.data)
                      setCurrentQ(0)
                      setAnswers([])
                      setShowResult(false)
                      setStartTime(Date.now())
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <div>
                        <h3 style={{
                          margin: "0 0 4px",
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#1a1a2e"
                        }}>{quiz.title}</h3>
                        <span style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>{quiz.subject}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{
                          margin: "0 0 4px",
                          fontSize: "13px",
                          color: "#6b7280"
                        }}>{quiz.question_count} questions</p>
                        <span style={{
                          background: quiz.difficulty === "easy"
                            ? "#f0fff4"
                            : quiz.difficulty === "medium"
                            ? "#fff7ed"
                            : "#fff5f5",
                          color: quiz.difficulty === "easy"
                            ? "#15803d"
                            : quiz.difficulty === "medium"
                            ? "#d97706"
                            : "#dc2626",
                          padding: "2px 8px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                    <p style={{
                      margin: "8px 0 0",
                      fontSize: "12px",
                      color: "#9ca3af"
                    }}>
                      Click to retake quiz →
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}