from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


async def chat_with_tutor(
    question: str,
    context: str = "",
    chat_history: list = []
) -> str:
    try:
        # Build messages
        messages = [
            {
                "role": "system",
                "content": f"""You are an expert AI study tutor helping a college student.
You are knowledgeable, patient, and explain concepts clearly.
Always give structured, easy-to-understand answers.
Use examples when helpful.
If context from notes is provided, use it to give more specific answers.

{"Context from student's notes: " + context if context else ""}"""
            }
        ]

        # Add chat history
        for msg in chat_history[-6:]:
            messages.append(msg)

        # Add current question
        messages.append({
            "role": "user",
            "content": question
        })

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Sorry, I couldn't process your question: {str(e)}"