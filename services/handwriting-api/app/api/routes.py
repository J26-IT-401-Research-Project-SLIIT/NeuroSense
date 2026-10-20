
# app/api/routes.py

import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.prediction_service import predict_handwriting

router = APIRouter(prefix="/api/v1/handwriting", tags=["Handwriting"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}


@router.post("/predict")
def predict(
    spiral_image: UploadFile = File(...),
    meander_image: UploadFile = File(...),
):
    """
    Accept Spiral and Meander handwriting images
    and return the handwriting model score.
    """

    for image in (spiral_image, meander_image):
        suffix = Path(image.filename or "").suffix.lower()

        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Only PNG, JPG and JPEG images are supported.",
            )

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)

            spiral_path = temp_path / "spiral.png"
            meander_path = temp_path / "meander.png"

            with spiral_path.open("wb") as file:
                shutil.copyfileobj(spiral_image.file, file)

            with meander_path.open("wb") as file:
                shutil.copyfileobj(meander_image.file, file)

            result = predict_handwriting(
                spiral_path=str(spiral_path),
                meander_path=str(meander_path),
            )

        return result

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Handwriting prediction failed: {str(exc)}",
        ) from exc

    finally:
        spiral_image.file.close()
        meander_image.file.close()
