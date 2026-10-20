
from fastapi import FastAPI

from app.api.routes import router as handwriting_router

app = FastAPI(
    title="NeuroSense Handwriting API",
    version="0.2.0",
    description="Handwriting-based Parkinson's screening inference API."
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
