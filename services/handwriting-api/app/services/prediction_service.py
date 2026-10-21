
import json
from pathlib import Path

import numpy as np

from app.services.model_loader import load_handwriting_models
from app.preprocessing.image_preprocessor import create_image_pair


# Load the 5 cross-validation models
MODELS = load_handwriting_models()

# Load calibration parameters from config_192px.json
PROJECT_ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = PROJECT_ROOT / "models" / "config_192px.json"

with open(CONFIG_PATH, "r", encoding="utf-8") as file:
    CONFIG = json.load(file)

PLATT_COEF = float(CONFIG["platt_coef"])
PLATT_INTERCEPT = float(CONFIG["platt_intercept"])


def calibrate_score(raw_score: float) -> float:
    """
    Convert the raw model probability into a calibrated score.

    Label 0 = Healthy
    Label 1 = Parkinson's Disease

    Lower score -> Healthy side
    Higher score -> PD side
    """
    epsilon = 1e-7

    # Avoid log(0) and log(1)
    probability = np.clip(raw_score, epsilon, 1.0 - epsilon)

    # Convert probability to log-odds (logit)
    logit_score = np.log(probability / (1.0 - probability))

    # Apply Platt scaling
    calibrated_logit = (
        PLATT_COEF * logit_score + PLATT_INTERCEPT
    )

    # Convert back to a score between 0 and 1
    calibrated_score = 1.0 / (
        1.0 + np.exp(-calibrated_logit)
    )

    return float(np.clip(calibrated_score, 0.0, 1.0))


def predict_handwriting(
    spiral_path: str,
    meander_path: str
) -> dict:

    spiral, meander = create_image_pair(
        spiral_path=spiral_path,
        meander_path=meander_path,
    )

    fold_scores = []

    # Get predictions from all 5 models
    for model in MODELS:
        prediction = model(
            [spiral, meander],
            training=False,
        )

        score = float(
            np.asarray(prediction).reshape(-1)[0]
        )

        fold_scores.append(score)

    # Average raw scores from the 5 models
    raw_mean_score = float(np.mean(fold_scores))

    # Apply calibration to the ensemble score
    calibrated_score = calibrate_score(raw_mean_score)

    return {
        "handwriting_score": round(calibrated_score, 6),
        "raw_model_score": round(raw_mean_score, 6),
        "raw_fold_scores": [
            round(score, 6) for score in fold_scores
        ],
    }
