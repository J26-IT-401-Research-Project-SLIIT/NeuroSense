import { useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, Feather, Entypo, MaterialCommunityIcons  } from '@expo/vector-icons';
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

export default function HandwritingAssessmentScreen({ navigation }: Props) {
  const [spiralImage, setSpiralImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [meanderImage, setMeanderImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const [isPicking, setIsPicking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDrawingType, setActiveDrawingType] =
    useState<DrawingType>("spiral");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

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

  const capturePhoto = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow camera access to capture a handwriting image.",
        );
        return;
      }
    }

    if (!cameraRef.current || !isCameraReady) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
      if (!photo) return;

      const capturedImage = {
        ...photo,
        fileName: `${activeDrawingType}.jpg`,
        mimeType: "image/jpeg",
        type: "image",
      } as ImagePicker.ImagePickerAsset;

      if (activeDrawingType === "spiral") {
        setSpiralImage(capturedImage);
      } else {
        setMeanderImage(capturedImage);
      }
    } catch {
      Alert.alert(
        "Unable to capture image",
        "Please try taking the photo again.",
      );
    }
  };

  const activeImage =
    activeDrawingType === "spiral" ? spiralImage : meanderImage;

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
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Close handwriting test"
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>NeuroScreen</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.title}>Handwriting Test</Text>

        <Text style={styles.subtitle}>
          Position your handwritten spiral or sentence within the frame and
          capture the photo.
        </Text>

        <View style={styles.stepRow}>
          <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
          <Text style={styles.stepComplete}>60% Complete</Text>
        </View>
        <View style={styles.stepTrack}>
          <View style={styles.stepFill} />
        </View>

        <View style={styles.tabs}>
          {(["spiral", "meander"] as DrawingType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.tab,
                activeDrawingType === type && styles.activeTab,
              ]}
              onPress={() => setActiveDrawingType(type)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeDrawingType === type }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeDrawingType === type && styles.activeTabText,
                ]}
              >
                {type === "spiral" ? "Spiral" : "Meander"}
              </Text>
              {(type === "spiral" ? spiralImage : meanderImage) && (
                <View style={styles.tabCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.cameraCard}>
          {!activeImage && cameraPermission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="back"
              mode="picture"
              onCameraReady={() => setIsCameraReady(true)}
              onMountError={() => setIsCameraReady(false)}
            />
          ) : !activeImage ? (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraPlaceholderIcon}>⌾</Text>
              <Text style={styles.cameraPlaceholderTitle}>
                Camera access is needed
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestCameraPermission}
              >
                <Text style={styles.permissionButtonText}>Enable Camera</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {activeImage && (
            <Image
              source={{ uri: activeImage.uri }}
              style={styles.capturedPreview}
              resizeMode="contain"
              accessibilityLabel={`${activeDrawingType} drawing preview`}
            />
          )}

          {!activeImage && (
            <View style={styles.cameraGuide} pointerEvents="none">
              <View style={styles.guideCorner} />
              <Text style={styles.guideText}>
                Frame the {activeDrawingType} drawing inside the guide
              </Text>
            </View>
          )}
        </View>

        {!activeImage ? (
          <View style={styles.beforeControls}>
            <TouchableOpacity
              style={styles.secondaryControl}
              onPress={() => pickImage(activeDrawingType)}
              disabled={isPicking}
              activeOpacity={0.8}
            >
              <View style={styles.secondaryControlIcon}>
                <MaterialCommunityIcons name="view-gallery-outline" size={24} color="#4D5B70" />
              </View>
              <Text style={styles.secondaryControlLabel}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={capturePhoto}
              disabled={!cameraPermission?.granted || !isCameraReady}
              accessibilityRole="button"
              accessibilityLabel={`Capture ${activeDrawingType} drawing`}
            >
              <View style={styles.captureButtonInner}>
                <Feather style={styles.cameraIcon} name="camera" size={24} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryControl}
              onPress={() => undefined}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Flash off"
            >
              <View style={styles.secondaryControlIcon}>
                <Entypo name="flash" size={24} color="#4D5B70" />
              </View>
              <Text style={styles.secondaryControlLabel}>Flash Off</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.afterControls}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => removeImage(activeDrawingType)}
              activeOpacity={0.8}
            >
              <View style={styles.changeContainer}>
                <Ionicons name="refresh" size={16} color="#4D5B70" />
                <Text style={styles.retakeText}>Retake Photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => pickImage(activeDrawingType)}
              disabled={isPicking}
              activeOpacity={0.8}
            >
              <View style={styles.changeContainer}>
                <Feather name="upload" size={14} color="#4D5B70" />
                <Text style={styles.changeText}>Upload</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.assessButton,
            !bothImagesSelected && styles.assessButtonDisabled,
          ]}
          onPress={handleAssess}
          disabled={isSubmitting || !bothImagesSelected}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.assessButtonText,
              !bothImagesSelected && styles.assessButtonTextDisabled,
            ]}
          >
            {isSubmitting
              ? "Analyzing images..."
              : bothImagesSelected
                ? "Analyze Photo"
                : "Take photo to analyze"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Research support tool only. Not a standalone medical diagnosis.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    marginBottom: 27,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF2",
  },
  closeButton: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#17243B",
    fontSize: 28,
    fontWeight: "300",
    lineHeight: 28,
  },
  headerSpacer: {
    position: "absolute",
    right: 0,
    width: 30,
    height: 30,
  },
  brand: {
    color: "#101827",
    fontSize: 16,
    fontWeight: "800",
  },
  title: {
    color: "#101827",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#4D5563",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 17,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  stepLabel: {
    color: "#4D5563",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  stepComplete: {
    color: "#3158C9",
    fontSize: 12,
    fontWeight: "800",
  },
  stepTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#DCE5F5",
    overflow: "hidden",
    marginBottom: 28,
  },
  stepFill: {
    width: "60%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#173996",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#E7EEFF",
    borderRadius: 13,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#245FC4",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tabText: {
    color: "#65738A",
    fontSize: 14,
    fontWeight: "700",
  },
  activeTabText: {
    color: "#245FC4",
  },
  tabCheck: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#239B69",
  },
  cameraCard: {
    height: 306,
    overflow: "hidden",
    position: "relative",
    borderRadius: 18,
    backgroundColor: "#17243B",
    marginBottom: 28,
  },
  cameraPreview: {
    ...StyleSheet.absoluteFill,
  },
  capturedPreview: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#F8FAFD",
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  cameraPlaceholderIcon: {
    color: "#B7CBF4",
    fontSize: 42,
    marginBottom: 8,
  },
  cameraPlaceholderTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 14,
  },
  permissionButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  permissionButtonText: {
    color: "#245FC4",
    fontSize: 13,
    fontWeight: "700",
  },
  cameraGuide: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  guideCorner: {
    width: "78%",
    height: "78%",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.65)",
    borderRadius: 2,
  },
  guideText: {
    position: "absolute",
    bottom: 15,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowRadius: 4,
  },
  captureButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: "#3974D8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#2563EB",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  captureButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3974D8",
  },
  cameraIcon: {
    color: "#FFFFFF",
    fontSize: 21,
  },
  beforeControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  secondaryControl: {
    width: 72,
    alignItems: "center",
    gap: 5,
  },
  secondaryControlIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8EDF5",
    borderWidth: 1,
    borderColor: "#D5DDE9",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryIcon: {
    color: "#40516A",
    fontSize: 24,
    fontWeight: "700",
  },
  flashIcon: {
    color: "#40516A",
    fontSize: 27,
    fontWeight: "700",
  },
  secondaryControlLabel: {
    color: "#4D5B70",
    fontSize: 11,
    fontWeight: "600",
  },
  afterControls: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  changeButton: {
    width: 110,
    borderRadius: 13,
    backgroundColor: "#F3F6FA",
    borderWidth: 1,
    borderColor: "#DCE3ED",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  changeText: {
    color: "#4D5B70",
    fontSize: 13,
    fontWeight: "700",
  },
  captureHint: {
    color: "#8792A3",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 17,
  },
  uploadImageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#8290AB",
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 10,
  },
  uploadImageIcon: {
    color: "#17243B",
    fontSize: 20,
    fontWeight: "700",
  },
  uploadImageText: {
    color: "#17243B",
    fontSize: 14,
    fontWeight: "700",
  },
  retakeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D2DAE7",
    borderRadius: 13,
    backgroundColor: "#E8EDF5",
    alignItems: "center",
    paddingVertical: 14,
  },
  retakeText: {
    color: "#65738A",
    fontSize: 14,
    fontWeight: "700",
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
    backgroundColor: "#2563EB",
    borderRadius: 13,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  assessButtonDisabled: {
    backgroundColor: "#EFF3F8",
    borderWidth: 1,
    borderColor: "#E1E7F0",
    shadowOpacity: 0,
  },
  assessButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  assessButtonTextDisabled: {
    color: "#94A4BB",
  },
  disclaimer: {
    color: "#8792A3",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 18,
  },
  changeContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  },
});
