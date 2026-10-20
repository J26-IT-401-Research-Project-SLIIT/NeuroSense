
# app/preprocessing/image_preprocessor.py

import numpy as np
from PIL import Image

from app.core.config import IMG_SIZE


def load_gray_image(image_path: str) -> np.ndarray:
    """
    Preprocess one handwriting image exactly as in training:
    grayscale -> LANCZOS resize -> normalize -> invert.
    Returns an array with shape (192, 192, 1).
    """

    with Image.open(image_path) as img:
        img = img.convert("L")
        img = img.resize(
            (IMG_SIZE[1], IMG_SIZE[0]),
            Image.Resampling.LANCZOS,
        )

        arr = np.asarray(img, dtype=np.float32) / 255.0

    # Match the training preprocessing.
    arr = 1.0 - arr

    # Add the grayscale channel dimension.
    return arr[..., None]


def create_image_pair(
    spiral_path: str,
    meander_path: str,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Prepare a Spiral and Meander image pair for model inference.

    Returns:
        spiral:  (1, 192, 192, 1)
        meander: (1, 192, 192, 1)
    """

    spiral = load_gray_image(spiral_path)
    meander = load_gray_image(meander_path)

    # Add batch dimensions.
    spiral = np.expand_dims(spiral, axis=0)
    meander = np.expand_dims(meander, axis=0)

    return spiral, meander
