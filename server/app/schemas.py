# QwizMate | SENG 564 | Fall 2026
# Author: Nick Moore

from typing import List, Literal

from pydantic import BaseModel, Field

Difficulty = Literal["easy", "medium", "hard"]


class QuizQuestion(BaseModel):
    id: str
    text: str
    options: List[str] = Field(min_length=4, max_length=4)
    correct: int = Field(ge=0, le=3)
    topic: str
    difficulty: Difficulty


class GenerateQuizResponse(BaseModel):
    questions: List[QuizQuestion]
