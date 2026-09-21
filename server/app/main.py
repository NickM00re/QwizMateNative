from typing import List

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .schemas import GenerateQuizResponse
from .services import document_extraction, quiz_generator

app = FastAPI(title="QwizMate Quiz Generator", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp", "image/heic"}
TEXT_TYPES = {"text/plain", "text/markdown"}
PDF_TYPE = "application/pdf"
PPTX_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/quiz/generate", response_model=GenerateQuizResponse)
async def create_quiz(
    files: List[UploadFile] = File(default=[]),
    notes_text: str = Form(default=""),
    num_questions: int = Form(default=5),
    difficulty: str = Form(default="mixed"),
):
    if not (1 <= num_questions <= 20):
        raise HTTPException(400, "num_questions must be between 1 and 20.")

    text_parts = [notes_text] if notes_text.strip() else []
    page_images: List[bytes] = []

    for upload in files:
        data = await upload.read()
        size_mb = len(data) / (1024 * 1024)
        if size_mb > config.MAX_UPLOAD_MB:
            raise HTTPException(400, f"{upload.filename} is over the {config.MAX_UPLOAD_MB}MB limit.")

        content_type = upload.content_type or ""
        if content_type in IMAGE_TYPES:
            page_images.append(data)
        elif content_type == PDF_TYPE:
            text, images = document_extraction.extract_pdf(data)
            if text:
                text_parts.append(text)
            page_images.extend(images)
        elif content_type == PPTX_TYPE:
            text_parts.append(document_extraction.extract_pptx(data))
        elif content_type in TEXT_TYPES:
            text_parts.append(data.decode("utf-8", errors="ignore"))
        else:
            raise HTTPException(400, f"Unsupported file type: {content_type or upload.filename}")

    combined_text = "\n\n".join(part for part in text_parts if part.strip())

    if not combined_text and not page_images:
        raise HTTPException(400, "Upload at least one note file or paste some notes text.")

    try:
        questions = quiz_generator.generate_quiz(
            notes_text=combined_text,
            page_images=page_images,
            num_questions=num_questions,
            difficulty=difficulty,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except RuntimeError as e:
        raise HTTPException(502, str(e))

    return GenerateQuizResponse(questions=questions)
