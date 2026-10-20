from fastapi import FastAPI

app = FastAPI(
    title="NeuroSense handwriting API",
    version="0.1.0",
    description="Starter API; model inference is not connected yet."
)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "handwriting-api",
        "inference_ready": False
    }

