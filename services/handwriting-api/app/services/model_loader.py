
# app/services/model_loader.py

from pathlib import Path

import tensorflow as tf

from app.core.config import MODEL_PATHS


def load_handwriting_models() -> list:
    """
    Load the five trained cross-validation models.
    """

    models = []

    for model_path in MODEL_PATHS:
        model_path = Path(model_path)

        if not model_path.is_file():
            raise FileNotFoundError(
                f"Trained model not found: {model_path}"
            )

        print(f"Loading model: {model_path.name}")

        model = tf.keras.models.load_model(
            model_path,
            compile=False
        )

        models.append(model)

        print(f"Loaded successfully: {model_path.name}")
        print(f"Input shapes: {model.input_shape}")
        print(f"Output shape: {model.output_shape}")

    print(f"\nTotal models loaded: {len(models)}")

    return models
