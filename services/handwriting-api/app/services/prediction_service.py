
# app/services/prediction_service.py

import numpy as np

from app.services.model_loader import load_handwriting_models
from app.preprocessing.image_preprocessor import create_image_pair
from app.core.config import PD_THRESHOLD


# Load the five models once when this module is imported.
MODELS = load_handwriting_models()


def predict_handwriting(
    spiral_path: str,
    meander_path: str,
) -> dict:
    """
    Predict a handwriting model score from a Spiral + Meander pair.

    The returned score is the mean of the five model outputs.
    It is not guaranteed to be a calibrated clinical probability.
    """

    spiral, meander = create_image_pair(
        spiral_path=spiral_path,
        meander_path=meander_path,
    )

    fold_scores = []

    for model in MODELS:
        prediction = model.predict(
            [spiral, meander],
            verbose=0,
        )

        score = float(np.asarray(prediction).reshape(-1)[0])
        fold_scores.append(score)

    mean_score = float(np.mean(fold_scores))

    return {
        "handwriting_score": round(mean_score * 100, 2),
        "mean_model_output": round(mean_score, 6),
        "threshold": PD_THRESHOLD,
        "prediction": (
            "PD"
            if mean_score >= PD_THRESHOLD
            else "Healthy"
        ),
        "fold_scores": [
            round(score, 6) for score in fold_scores
        ],
    }
