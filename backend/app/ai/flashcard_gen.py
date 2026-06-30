from groq import Groq
import os
import json
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


async def generate_flashcards(text: str, num_cards: int = 10) -> list:
    try:
        words = text.split()
        if len(words) > 3000:
            text = ' '.join(words[:3000])

        prompt = f"""Create {num_cards} flashcards from these study notes.
Return ONLY a valid JSON array, no other text, no markdown.
Format:
[
  {{"front": "Question or term", "back": "Answer or definition"}}
]

Study notes:
{text}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.3
        )

        response_text = response.choices[0].message.content.strip()

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        cards = json.loads(response_text.strip())
        return cards

    except Exception as e:
        print(f"Flashcard generation error: {str(e)}")
        return []