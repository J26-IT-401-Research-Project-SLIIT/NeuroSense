
# app/core/config.py

import json
from pathlib import Path

# Project paths
SERVICE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = SERVICE_DIR / "models"

# Model configuration file
CONFIG_PATH = MODEL_DIR / "config_192px.json"


def load_model_config() -> dict:
    """Load and validate the saved handwriting model configuration."""

    if not CONFIG_PATH.is_file():
        raise FileNotFoundError(
            f"Model configuration not found: {CONFIG_PATH}"
        )

    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        config = json.load(file)

    required_keys = {
        "img_size",
        "filters",
        "threshold",
        "epochs",
    }

    missing_keys = required_keys - config.keys()

    if missing_keys:
        raise ValueError(
            f"Missing configuration keys: {sorted(missing_keys)}"
        )

    return config


# Load configuration
MODEL_CONFIG = load_model_config()

# Convenient settings
IMG_SIZE = tuple(MODEL_CONFIG["img_size"])
CNN_FILTERS = MODEL_CONFIG["filters"]
PD_THRESHOLD = float(MODEL_CONFIG["threshold"])
TRAINING_EPOCHS = int(MODEL_CONFIG["epochs"])

# Saved cross-validation models
MODEL_PATHS = [
    MODEL_DIR / f"fold{i}_192px.keras"
    for i in range(1, 6)
]
