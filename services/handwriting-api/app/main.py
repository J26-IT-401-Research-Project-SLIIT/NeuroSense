
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as handwriting_router

app = FastAPI(
    title="NeuroSense Handwriting API",
    version="0.2.0",
    description="Handwriting-based Parkinson's screening inference API."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",
        "http://localhost:19000",
        "http://localhost:8081",
        "http://127.0.0.1:19006",
        "http://127.0.0.1:19000",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Register handwriting prediction endpoint
app.include_router(handwriting_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "handwriting-api",
        "inference_ready": True
    }
