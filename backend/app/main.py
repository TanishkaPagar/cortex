from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, notes, quiz, chat, flashcards, planner, analytics

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered study platform for college students",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(quiz.router)
app.include_router(chat.router)
app.include_router(flashcards.router)
app.include_router(planner.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "status": "running",
        "version": "1.0.0",
        "docs": "http://localhost:8000/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}