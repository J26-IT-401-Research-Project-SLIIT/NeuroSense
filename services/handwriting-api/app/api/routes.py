
# app/api/routes.py

import tempfile
from pathlib import Path
from io import BytesIO

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.services.prediction_service import predict_handwriting

router = APIRouter(
    prefix="/api/v1/handwriting",
    tags=["Handwriting"],
)

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB per image


async def validate_image(image: UploadFile) -> bytes:
    """Validate image extension, size and actual image content."""

    filename = image.filename or ""
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format for '{filename}'. Use PNG, JPG or JPEG.",
        )

    content = await image.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail=f"The uploaded image '{filename}' is empty.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Image '{filename}' exceeds the 10 MB limit.",
        )

    try:
        with Image.open(BytesIO(content)) as img:
            if img.format not in {"PNG", "JPEG"}:
                raise HTTPException(
                    status_code=400,
                    detail=f"The actual content of '{filename}' is not PNG or JPEG.",
                )

            img.verify()

    except (UnidentifiedImageError, OSError, SyntaxError):
        raise HTTPException(
            status_code=400,
            detail=f"'{filename}' is not a valid image or is corrupted.",
        )

    return content


@router.post("/predict")
async def predict(
    spiral_image: UploadFile = File(...),
    meander_image: UploadFile = File(...),
):
    """
    Accept Spiral and Meander handwriting images
    and return the handwriting model score.
    """

    try:
        spiral_content = await validate_image(spiral_image)
        meander_content = await validate_image(meander_image)

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            spiral_path = temp_path / "spiral.png"
            meander_path = temp_path / "meander.png"

            spiral_path.write_bytes(spiral_content)
            meander_path.write_bytes(meander_content)

            result = predict_handwriting(
                spiral_path=str(spiral_path),
                meander_path=str(meander_path),
            )

        return result

    except HTTPException:
        raise

    except Exception:
        # Avoid exposing internal paths or model details to API clients.
        raise HTTPException(
            status_code=500,
            detail="Handwriting prediction failed. Please check the images and try again.",
        )

    finally:
        await spiral_image.close()
        await meander_image.close()
