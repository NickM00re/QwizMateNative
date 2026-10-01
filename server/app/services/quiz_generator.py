# QwizMate | SENG 564 | Fall 2026
# Author: Nick Moore

import base64
import json
from typing import List, Optional

from openai import OpenAI, OpenAIError

from .. import config
from ..schemas import QuizQuestion

_client: Optional[OpenAI] = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        if not config.OPENAI_API_KEY:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Copy server/.env.example to "
                "server/.env and add your key."
            )
        _client = OpenAI(api_key=config.OPENAI_API_KEY)
    return _client


# Kept deliberately simple (no minItems/maxItems/etc): OpenAI's strict
# structured-output mode only supports a subset of JSON Schema, so option
# count and answer-index bounds are re-checked in Python below instead.
QUIZ_JSON_SCHEMA = {
    "name": "quiz",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "questions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string"},
                        "options": {"type": "array", "items": {"type": "string"}},
                        "correct": {"type": "integer"},
                        "topic": {"type": "string"},
                        "difficulty": {
                            "type": "string",
                            "enum": ["easy", "medium", "hard"],
                        },
                    },
                    "required": ["text", "options", "correct", "topic", "difficulty"],
                    "additionalProperties": False,
                },
            }
        },
        "required": ["questions"],
        "additionalProperties": False,
    },
}


def _image_content_block(png_bytes: bytes) -> dict:
    b64 = base64.b64encode(png_bytes).decode("ascii")
    return {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}}


def generate_quiz(
    *,
    notes_text: str,
    page_images: List[bytes],
    num_questions: int,
    difficulty: str,
) -> List[QuizQuestion]:
    if not notes_text.strip() and not page_images:
        raise ValueError("No usable notes content was provided.")

    client = get_client()

    content: List[dict] = [
        {
            "type": "text",
            "text": (
                f"Generate {num_questions} multiple-choice quiz questions from the "
                f"study notes below or in the attached images. Target difficulty: "
                f"{difficulty}. Each question needs exactly 4 options, exactly one "
                "correct answer given as a 0-indexed integer, and a short topic "
                "label naming the concept it tests. Base every question strictly "
                "on the provided material — do not invent facts that aren't in it."
            ),
        }
    ]
    if notes_text.strip():
        content.append({"type": "text", "text": f"NOTES:\n{notes_text}"})
    for image in page_images:
        content.append(_image_content_block(image))

    try:
        response = client.chat.completions.create(
            model=config.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a study assistant that turns a student's notes "
                        "(typed text, slides, or photos/scans of handwritten pages) "
                        "into accurate multiple-choice quiz questions."
                    ),
                },
                {"role": "user", "content": content},
            ],
            response_format={"type": "json_schema", "json_schema": QUIZ_JSON_SCHEMA},
        )
    except OpenAIError as e:
        raise RuntimeError(f"OpenAI request failed: {e}") from e

    parsed = json.loads(response.choices[0].message.content)

    questions: List[QuizQuestion] = []
    for i, q in enumerate(parsed.get("questions", [])):
        options = q.get("options") or []
        if len(options) != 4:
            continue  # skip malformed entries rather than failing the whole batch
        correct = q.get("correct", 0)
        if not (0 <= correct < 4):
            correct = 0
        questions.append(
            QuizQuestion(
                id=f"q{i + 1}",
                text=q["text"],
                options=options,
                correct=correct,
                topic=q.get("topic", "General"),
                difficulty=q.get("difficulty", "medium"),
            )
        )

    if not questions:
        raise RuntimeError("The model did not return any usable questions.")

    return questions
