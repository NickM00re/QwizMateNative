# QwizMate quiz-generation server

A small FastAPI service that sits between the React Native app and OpenAI.
Its whole job is to hold your `OPENAI_API_KEY` server-side, so the key never
ships inside the mobile app bundle. The app uploads notes (text, PDF, PPTX,
or photos of handwritten pages) here, and this service turns them into a
structured multiple-choice quiz using OpenAI's vision + structured-output
support.

No agent framework here on purpose — quiz generation is one well-scoped LLM
call (read the notes, output questions in a fixed JSON shape), so a direct
API call is simpler and more reliable than routing it through LangChain/etc.

## Setup

```bash
cd server
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
copy .env.example .env          # Windows: `cp .env.example .env` elsewhere
```

Edit `.env` and set `OPENAI_API_KEY=sk-...`. **Never commit `.env`** — it's
already in `.gitignore`. If you want the exact dependency versions this was
built and tested against, use `pip install -r requirements-lock.txt` instead.

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- `--host 0.0.0.0` lets a physical phone on the same Wi-Fi (via Expo Go)
  reach it at `http://<your-computer's-LAN-IP>:8000`.
- The Android emulator reaches your machine at `http://10.0.2.2:8000`.
- iOS simulator / web can use `http://localhost:8000` directly.

Check it's up: `curl http://localhost:8000/health` → `{"status":"ok"}`.

## API

### `POST /api/quiz/generate`

`multipart/form-data`:

| field           | type            | notes                                            |
|-----------------|-----------------|---------------------------------------------------|
| `files`         | file(s)         | any of: image (png/jpg/webp/heic), pdf, pptx, txt |
| `notes_text`    | string          | optional pasted/typed notes, combined with files  |
| `num_questions` | int (1-20)      | default 5                                         |
| `difficulty`    | string          | e.g. `"easy"`, `"medium"`, `"hard"`, `"mixed"`    |

At least one of `files` or `notes_text` must have real content.

PDFs are text-extracted when possible; if a PDF has little/no extractable
text (i.e. it's scanned or handwritten), its pages are rasterized and sent
to the model as images instead — same path as an uploaded photo, no OCR
step needed since the vision model reads the image directly.

Response:

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "What is the powerhouse of the cell?",
      "options": ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
      "correct": 1,
      "topic": "Cell Biology",
      "difficulty": "easy"
    }
  ]
}
```

This shape matches `QuizQuestion` in the RN app's `src/types.ts`, so the
client can drop the response straight into state.

## Deploying (so grading doesn't depend on your laptop being on)

Any small host with an env-var secrets panel works — free tiers on
[Render](https://render.com), [Railway](https://railway.app), or
[Fly.io](https://fly.io) are all enough for this. General shape:

1. Push this `server/` folder (without `.env`) to its own repo or as a
   subdirectory of your project's repo.
2. Create a new web service pointed at it, build command
   `pip install -r requirements.txt`, start command
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, `ALLOWED_ORIGINS`)
   as secret environment variables in the host's dashboard — never in code.
4. Point the RN app's API base URL at the deployed host instead of
   `localhost`.

## Notes / limits

- `MAX_UPLOAD_MB` (default 20) caps individual file size.
- `OPENAI_MODEL` defaults to `gpt-4o-mini`; bump to `gpt-4o` in `.env` if you
  want stronger handwriting reading / reasoning at higher cost.
- `ALLOWED_ORIGINS` defaults to `*` for local development. Tighten it before
  handing the deployed URL to anyone else.
