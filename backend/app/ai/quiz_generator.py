from groq import Groq
import os
import json
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


async def generate_quiz(text: str, num_questions: int = 10, difficulty: str = "medium") -> list:
    try:
        words = text.split()
        if len(words) > 3000:
            text = ' '.join(words[:3000])

        prompt = f"""You are an expert professor creating a quiz.
Based on the following study notes, generate exactly {num_questions} multiple choice questions.
Difficulty level: {difficulty}

IMPORTANT: Return ONLY a valid JSON array, no other text, no markdown.
Format:
[
  {{
    "question": "What is...?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "answer": "A) option1",
    "explanation": "Brief explanation why this is correct"
  }}
]

Study notes:
{text}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=2000,
            temperature=0.3
        )

        response_text = response.choices[0].message.content.strip()

        # Clean response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        questions = json.loads(response_text.strip())
        return questions

    except Exception as e:
        print(f"Quiz generation error: {str(e)}")
        return []