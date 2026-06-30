import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cortex — AI Study Companion",
  description: "AI-powered study platform for college students",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}