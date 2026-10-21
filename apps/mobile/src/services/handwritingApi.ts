import type { ImagePickerAsset } from "expo-image-picker";

const HANDWRITING_API_URL = "http://localhost:8003";

export type HandwritingPredictionResponse = {
  handwriting_score: number;
  raw_model_score: number;
  raw_fold_scores: number[];
};

async function appendImage(
  formData: FormData,
  fieldName: string,
  image: ImagePickerAsset,
  fallbackName: string,
) {
  const imageResponse = await fetch(image.uri);

  if (!imageResponse.ok) {
    throw new Error(
      `Unable to read the ${fieldName.replace("_image", "")} image.`,
    );
  }

  const imageBlob = await imageResponse.blob();
  const fileName = image.fileName || fallbackName;
  formData.append(fieldName, imageBlob, fileName);
}

export async function predictHandwriting(
  spiralImage: ImagePickerAsset,
  meanderImage: ImagePickerAsset,
): Promise<HandwritingPredictionResponse> {
  const formData = new FormData();

  await appendImage(formData, "spiral_image", spiralImage, "spiral.jpg");
  await appendImage(formData, "meander_image", meanderImage, "meander.jpg");

  const response = await fetch(
    `${HANDWRITING_API_URL}/api/v1/handwriting/predict`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    let message = "Handwriting prediction failed.";

    try {
      const errorBody = await response.json();
      if (typeof errorBody.detail === "string") {
        message = errorBody.detail;
      }
    } catch {
      // Keep the generic message when the server does not return JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<HandwritingPredictionResponse>;
}
