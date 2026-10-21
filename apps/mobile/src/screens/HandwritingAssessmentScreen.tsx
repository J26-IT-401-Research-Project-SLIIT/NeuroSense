import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { predictHandwriting } from "../services/handwritingApi";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "HandwritingAssessment"
>;

type DrawingType = "spiral" | "meander";

type ImageCardProps = {
  title: string;
  description: string;
  image: ImagePicker.ImagePickerAsset | null;
  onSelect: () => void;
  onRemove: () => void;
};

export default function HandwritingAssessmentScreen({ navigation }: Props) {
  const [spiralImage, setSpiralImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [meanderImage, setMeanderImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [isPicking, setIsPicking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (type: DrawingType) => {
    if (isPicking) return;

    try {
      setIsPicking(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to select handwriting images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const image = result.assets[0];

      if (type === "spiral") {
        setSpiralImage(image);
      } else {
        setMeanderImage(image);
      }
    } catch {
      Alert.alert(
        "Unable to select image",
        "Please try selecting the image again.",
      );
    } finally {
      setIsPicking(false);
    }
  };

  const removeImage = (type: DrawingType) => {
    if (type === "spiral") {
      setSpiralImage(null);
    } else {
      setMeanderImage(null);
    }
  };

  const handleAssess = async () => {
    if (isSubmitting) return;

    if (!spiralImage || !meanderImage) {
      Alert.alert(
        "Images required",
        "Please select both Spiral and Meander images before continuing.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await predictHandwriting(spiralImage, meanderImage);

      navigation.navigate("AssessmentResult", {
        spiralUri: spiralImage.uri,
        meanderUri: meanderImage.uri,
        result,
      });
    } catch (error) {
      Alert.alert(
        "Assessment failed",
        error instanceof Error
          ? error.message
          : "Unable to assess the selected images. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const bothImagesSelected = Boolean(spiralImage && meanderImage);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>NeuroSense</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>HANDWRITING</Text>
          </View>
        </View>

        <Text style={styles.title}>Handwriting Assessment</Text>

        <Text style={styles.subtitle}>
          Upload the patient's spiral and meander drawing samples to prepare a
          handwriting assessment.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Before you continue</Text>
          <Text style={styles.infoText}>
            Select the correct drawing type for each image. Make sure both
            images are clear and readable.
          </Text>
        </View>

        <ImageCard
          title="Spiral Drawing"
          description="Upload the patient's spiral drawing."
          image={spiralImage}
          onSelect={() => pickImage("spiral")}
          onRemove={() => removeImage("spiral")}
        />

        <ImageCard
          title="Meander Drawing"
          description="Upload the patient's meander drawing."
          image={meanderImage}
          onSelect={() => pickImage("meander")}
          onRemove={() => removeImage("meander")}
        />

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Upload progress</Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Spiral image</Text>
            <Text
              style={spiralImage ? styles.completedText : styles.pendingText}
            >
              {spiralImage ? "Selected" : "Pending"}
            </Text>
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Meander image</Text>
            <Text
              style={meanderImage ? styles.completedText : styles.pendingText}
            >
              {meanderImage ? "Selected" : "Pending"}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: bothImagesSelected
                    ? "100%"
                    : spiralImage || meanderImage
                      ? "50%"
                      : "0%",
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.assessButton,
            !bothImagesSelected && styles.assessButtonDisabled,
          ]}
          onPress={handleAssess}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.assessButtonText}>
            {isSubmitting ? "Analyzing images..." : "Continue to Results →"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Research support tool only. Not a standalone medical diagnosis.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ImageCard({
  title,
  description,
  image,
  onSelect,
  onRemove,
}: ImageCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>
            {title.startsWith("Spiral") ? "S" : "M"}
          </Text>
        </View>

        <View style={styles.cardHeading}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {image ? (
        <Image
          source={{ uri: image.uri }}
          style={styles.preview}
          resizeMode="contain"
          accessibilityLabel={`${title} preview`}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderSymbol}>＋</Text>
          <Text style={styles.placeholderText}>No image selected</Text>
          <Text style={styles.placeholderHint}>
            Choose an image from your device
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={onSelect}
        activeOpacity={0.75}
      >
        <Text style={styles.uploadButtonText}>
          {image ? "Change Image" : "Select Image"}
        </Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.selectedRow}>
          <View style={styles.selectedIndicator} />
          <Text style={styles.fileName} numberOfLines={2}>
            {image.fileName || "Selected image"}
          </Text>

          <TouchableOpacity
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${title}`}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  content: {
    padding: 22,
    paddingTop: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  brand: {
    color: "#3974D8",
    fontSize: 18,
    fontWeight: "800",
  },
  stepBadge: {
    backgroundColor: "#E7EEFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stepText: {
    color: "#315FA8",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  title: {
    color: "#17243B",
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#65738A",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#EAF1FF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
  },
  infoTitle: {
    color: "#245FC4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoText: {
    color: "#3B5278",
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardIconText: {
    color: "#3974D8",
    fontSize: 19,
    fontWeight: "800",
  },
  cardHeading: {
    flex: 1,
  },
  cardTitle: {
    color: "#17243B",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 5,
  },
  description: {
    color: "#65738A",
    fontSize: 13,
    lineHeight: 19,
  },
  placeholder: {
    height: 165,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EF",
    borderStyle: "dashed",
    backgroundColor: "#F8FAFD",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderSymbol: {
    color: "#3974D8",
    fontSize: 32,
    marginBottom: 6,
  },
  placeholderText: {
    color: "#65738A",
    fontSize: 14,
    fontWeight: "600",
  },
  placeholderHint: {
    color: "#98A3B3",
    fontSize: 12,
    marginTop: 6,
  },
  preview: {
    width: "100%",
    height: 210,
    borderRadius: 12,
    backgroundColor: "#F8FAFD",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#3974D8",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 14,
  },
  uploadButtonText: {
    color: "#3974D8",
    fontSize: 14,
    fontWeight: "700",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#239B69",
  },
  fileName: {
    flex: 1,
    color: "#65738A",
    fontSize: 12,
  },
  removeText: {
    color: "#C24141",
    fontSize: 12,
    fontWeight: "600",
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  progressTitle: {
    color: "#17243B",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressLabel: {
    color: "#65738A",
    fontSize: 13,
  },
  completedText: {
    color: "#168456",
    fontSize: 13,
    fontWeight: "700",
  },
  pendingText: {
    color: "#98A3B3",
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E8EDF5",
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3974D8",
    borderRadius: 3,
  },
  assessButton: {
    backgroundColor: "#3974D8",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  assessButtonDisabled: {
    backgroundColor: "#7899D5",
  },
  assessButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disclaimer: {
    color: "#8792A3",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 18,
  },
});
