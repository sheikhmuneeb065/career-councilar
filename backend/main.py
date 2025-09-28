# backend/main.py
from fastapi import FastAPI
import crud, schemas
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import importlib
from typing import Any

# Load environment variables
load_dotenv()

# single FastAPI app (ensure middleware attaches to the correct instance)
app = FastAPI(title="Career Counseling Chatbot")

# Allow frontend React app to connect
app.add_middleware(
    CORSMiddleware,
    # allow both localhost and 127.0.0.1 variants so Vite/dev servers aren't blocked by CORS/OPTIONS
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],  # React/Vite dev
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, GET, etc.
    allow_headers=["*"],
)

# Configure Google Gemini API if available; otherwise we'll fallback to rule-based replies
MODEL_AVAILABLE = False
try:
    import google.generativeai as genai

    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_KEY:
        genai.configure(api_key=GEMINI_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")
        MODEL_AVAILABLE = True
except Exception:
    MODEL_AVAILABLE = False

# Try to detect OpenAI key (used as a fallback provider)
OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not MODEL_AVAILABLE and OPENAI_KEY:
    MODEL_AVAILABLE = True
    MODEL_PROVIDER = "openai"
elif MODEL_AVAILABLE:
    MODEL_PROVIDER = "gemini"
else:
    MODEL_PROVIDER = None

    # Diagnostics
    GEN_CALL_COUNT = 0
    GEN_FAILURE_COUNT = 0
    LAST_GEN_ERROR = None


async def generate_ai_reply(message: str) -> str:
    """Async reply generator: Gemini > OpenAI > rule-based fallback."""
    global GEN_CALL_COUNT, GEN_FAILURE_COUNT, LAST_GEN_ERROR
    GEN_CALL_COUNT += 1
    LAST_GEN_ERROR = None
    # Gemini provider
    if MODEL_PROVIDER == "gemini":
        try:
            prompt = f"""
You are a professional career counseling assistant.
Only answer questions related to careers, jobs, education, or skills.
If the user asks something unrelated, politely tell them you only handle career counseling.

User: {message}
"""
            # model.generate_content may be blocking; run in thread
            resp = await asyncio.to_thread(lambda: model.generate_content(prompt))
            text = resp.text if resp and getattr(resp, "text", None) else "Sorry, I couldn’t generate a response."
            return text
        except Exception:
            # fall through to next provider
            GEN_FAILURE_COUNT += 1
            LAST_GEN_ERROR = "gemini_exception"
            pass

    # OpenAI provider
    if MODEL_PROVIDER == "openai":
        try:
            openai: Any = importlib.import_module("openai")
            openai.api_key = OPENAI_KEY
            def call_openai():
                return openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": (
                            "You are a helpful career counselor. Answer ONLY about careers, skills, education, job search, "
                            "resume tips, interview prep and professional development. If asked outside this domain, politely decline.")},
                        {"role": "user", "content": message},
                    ],
                    max_tokens=300,
                    temperature=0.2,
                )
            resp = await asyncio.to_thread(call_openai)
            text = resp.choices[0].message.content.strip()
            return text
        except Exception:
            GEN_FAILURE_COUNT += 1
            LAST_GEN_ERROR = "openai_exception"
            pass

    # rule-based fallback
    msg = (message or "").lower()
    if any(k in msg for k in ("best career", "which career", "what career", "choose a career")):
        return (
            "Good options today include Software Engineering, Data Science, Product Management, and Cloud Engineering — choose based on your interests and strengths."
        )
    if "skills" in msg or "skill" in msg or "skills required" in msg:
        return "In-demand skills: programming (Python/JavaScript), data analysis, cloud platforms (AWS/GCP/Azure), version control, and communication."
    if "resume" in msg or "cv" in msg:
        return "For resumes: highlight impact (metrics), use concise bullet points, tailor to the job, and keep it to one page for early-career."
    if "interview" in msg or "how to prepare" in msg:
        return "Practice common behavioral and technical questions, do mock interviews, study the company's products, and prepare short STAR-format stories for behavioral answers."
    if "hello" in msg or "hi" in msg:
        return "Hello! I'm your Career Counselor Bot. Ask me about career paths, skills to learn, resume tips, or interview prep."

    return "I can help with careers, required skills, resumes, interviews, and learning paths. Could you ask a career-related question?"


@app.get("/")
def root():
    return {"message": "Career Counseling Chatbot Backend is running. Use POST /chat to talk to the bot."}


@app.get("/status")
def status():
    return {
        "model_provider": MODEL_PROVIDER,
        "gemini_key_present": bool(os.getenv("GEMINI_API_KEY")),
        "openai_key_present": bool(os.getenv("OPENAI_API_KEY")),
        "gen_call_count": GEN_CALL_COUNT,
        "gen_failure_count": GEN_FAILURE_COUNT,
        "last_gen_error": LAST_GEN_ERROR,
    }


@app.post("/chat", response_model=schemas.ChatResponse)
async def chat(request: schemas.ChatRequest):
    # accept either `user` or `user_id` for compatibility with frontend
    user_id = request.user_id or request.user or "anonymous"
    try:
        # generate_ai_reply is async; await it so we have the actual string
        reply = await generate_ai_reply(request.message)
    except Exception as e:
        # Log the error server-side and fallback to a safe reply
        # (avoid raising uncaught exceptions which return 500)
        print(f"Error generating reply: {e}")
        reply = (
            "Sorry, I'm having trouble generating a response right now. "
            "I can still help with career questions — try asking about skills, resumes, or interview prep."
        )

    try:
        crud.save_chat(user_id, request.message, reply)
    except Exception as e:
        # don't fail the request if saving the chat fails
        print(f"Warning: failed to save chat: {e}")

    return {"response": reply}


@app.get("/history/{user_id}")
def history(user_id: str):
    return crud.get_chat_history(user_id)
