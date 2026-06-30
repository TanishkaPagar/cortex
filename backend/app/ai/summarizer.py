from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env file
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Configure Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def summarize_text(text: str) -> str:
    try:
        words = text.split()
        if len(words) > 4000:
            text = ' '.join(words[:4000])

        prompt = f"""You are an expert study assistant.
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
- [point 3]

Here are the study notes to summarize:

{text}"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        return response.text

    except Exception as e:
        return f"Summary could not be generated: {str(e)}"


async def generate_key_topics(text: str) -> list[str]:
    try:
        words = text.split()
        if len(words) > 2000:
            text = ' '.join(words[:2000])

        prompt = f"Extract the main topics from this text. Return ONLY a comma-separated list of topics, nothing else:\n\n{text}"

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        topics_str = response.text
        topics = [t.strip() for t in topics_str.split(',')]
        return topics[:10]

    except Exception as e:
        return ["General Study Notes"]