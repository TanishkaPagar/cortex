from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


async def summarize_text(text: str) -> str:
    try:
        words = text.split()
        if len(words) > 4000:
            text = ' '.join(words[:4000])

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert study assistant.
Summarize the given text in a clear, structured way.
Use this format:

📌 MAIN TOPIC: [topic name]

🔑 KEY CONCEPTS:
- [concept 1]
- [concept 2]
- [concept 3]

📝 SUMMARY:
[2-3 paragraph summary]

⚡ IMPORTANT POINTS:
- [point 1]
- [point 2]
- [point 3]"""
                },
                {
                    "role": "user",
                    "content": f"Please summarize these study notes:\n\n{text}"
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"Summary could not be generated: {str(e)}"


async def generate_key_topics(text: str) -> list[str]:
    try:
        words = text.split()
        if len(words) > 2000:
            text = ' '.join(words[:2000])

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "Extract the main topics from this text. Return ONLY a comma-separated list of topics, nothing else."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            max_tokens=200,
            temperature=0.3
        )
        topics_str = response.choices[0].message.content
        topics = [t.strip() for t in topics_str.split(',')]
        return topics[:10]

    except Exception as e:
        return ["General Study Notes"]