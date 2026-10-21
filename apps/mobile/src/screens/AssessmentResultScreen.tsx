import { StatusBar } from "expo-status-bar";
import {
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

type Props = NativeStackScreenProps<RootStackParamList, "AssessmentResult">;

export default function AssessmentResultScreen({ route, navigation }: Props) {
  const { spiralUri, meanderUri, result } = route.params;

  const scorePercent = result.handwriting_score * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back to Assessment</Text>
        </TouchableOpacity>

        <Text style={styles.brand}>NeuroSense</Text>
        <Text style={styles.title}>Handwriting Results</Text>
        <Text style={styles.subtitle}>
          Summary of the submitted Spiral and Meander handwriting samples.
        </Text>

        {/* Prediction */}
        <View style={styles.predictionCard}>
          <Text style={styles.cardLabel}>Model Prediction</Text>

          <View style={styles.predictionRow}>
            <View>
              <Text style={styles.predictionValue}>Not provided</Text>
              <Text style={styles.predictionCaption}>
                The API response contains scores, not a class label.
              </Text>
            </View>

            <View style={styles.predictionIcon}>
              <Text style={styles.predictionIconText}>--</Text>
            </View>
          </View>

          <Text style={styles.disclaimerSmall}>
            Research model output — not a clinical diagnosis.
          </Text>
        </View>

        {/* Handwriting score */}
        <View style={styles.scoreCard}>
          <Text style={styles.cardLabel}>Handwriting Score</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>{scorePercent.toFixed(1)}%</Text>
            <Text style={styles.scoreRange}>out of 100</Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${scorePercent}%` }]}
            />
          </View>

          <Text style={styles.scoreDescription}>
            Calibrated handwriting model score.
          </Text>
        </View>

        {/* Raw score */}
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Overall Model Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Raw model score</Text>
            <Text style={styles.detailValue}>
              {result.raw_model_score.toFixed(4)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Number of fold models</Text>
            <Text style={styles.detailValue}>
              {result.raw_fold_scores.length}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mean fold score</Text>
            <Text style={styles.detailValue}>
              {(
                result.raw_fold_scores.reduce((sum, score) => sum + score, 0) /
                result.raw_fold_scores.length
              ).toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Individual fold scores */}
        <Text style={styles.sectionTitle}>Individual Fold Predictions</Text>
        <Text style={styles.sectionSubtitle}>
          Each of the five trained fold models has its own output.
        </Text>

        {result.raw_fold_scores.map((score, index) => (
          <View key={index} style={styles.foldCard}>
            <View style={styles.foldHeader}>
              <View style={styles.foldNumber}>
                <Text style={styles.foldNumberText}>{index + 1}</Text>
              </View>

              <View style={styles.foldInfo}>
                <Text style={styles.foldTitle}>Fold {index + 1}</Text>
                <Text style={styles.foldSubtitle}>Individual model score</Text>
              </View>

              <Text style={styles.foldScore}>{(score * 100).toFixed(1)}%</Text>
            </View>

            <View style={styles.foldTrack}>
              <View style={[styles.foldFill, { width: `${score * 100}%` }]} />
            </View>
          </View>
        ))}

        {/* Uploaded images */}
        <Text style={styles.sectionTitle}>Submitted Images</Text>

        <View style={styles.imageCard}>
          <Text style={styles.imageTitle}>Spiral Drawing</Text>
          <Image
            source={{ uri: spiralUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        </View>

        <View style={styles.imageCard}>
          <Text style={styles.imageTitle}>Meander Drawing</Text>
          <Image
            source={{ uri: meanderUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Clinical Note</Text>
          <Text style={styles.noticeText}>
            This screen presents model outputs for research purposes. The
            handwriting score is not a validated measure of disease severity. A
            qualified clinician should interpret findings alongside the
            patient's other assessments.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            Back to Handwriting Assessment
          </Text>
        </TouchableOpacity>
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
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  backText: {
    color: "#3974D8",
    fontSize: 14,
    fontWeight: "600",
  },
  brand: {
    color: "#3974D8",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  title: {
    color: "#17243B",
    fontSize: 27,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#65738A",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 22,
  },
  predictionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  cardLabel: {
    color: "#65738A",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  predictionValue: {
    color: "#245FC4",
    fontSize: 30,
    fontWeight: "800",
  },
  predictionCaption: {
    color: "#65738A",
    fontSize: 12,
    marginTop: 5,
  },
  predictionIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  predictionIconText: {
    color: "#3974D8",
    fontSize: 18,
    fontWeight: "800",
  },
  disclaimerSmall: {
    color: "#8792A3",
    fontSize: 11,
    marginTop: 16,
    lineHeight: 17,
  },
  scoreCard: {
    backgroundColor: "#EAF1FF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 14,
  },
  scoreValue: {
    color: "#245FC4",
    fontSize: 40,
    fontWeight: "800",
  },
  scoreRange: {
    color: "#65738A",
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#D5E2FA",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3974D8",
    borderRadius: 5,
  },
  scoreDescription: {
    color: "#3B5278",
    fontSize: 12,
    marginTop: 12,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  sectionTitle: {
    color: "#17243B",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: "#65738A",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 5,
  },
  detailLabel: {
    color: "#65738A",
    fontSize: 13,
    flex: 1,
  },
  detailValue: {
    color: "#17243B",
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5EAF2",
    marginVertical: 12,
  },
  foldCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  foldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  foldNumber: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  foldNumberText: {
    color: "#3974D8",
    fontSize: 15,
    fontWeight: "800",
  },
  foldInfo: {
    flex: 1,
  },
  foldTitle: {
    color: "#17243B",
    fontSize: 14,
    fontWeight: "700",
  },
  foldSubtitle: {
    color: "#8792A3",
    fontSize: 11,
    marginTop: 4,
  },
  foldScore: {
    color: "#245FC4",
    fontSize: 17,
    fontWeight: "800",
  },
  foldTrack: {
    height: 6,
    backgroundColor: "#E8EDF5",
    borderRadius: 4,
    overflow: "hidden",
  },
  foldFill: {
    height: "100%",
    backgroundColor: "#3974D8",
    borderRadius: 4,
  },
  imageCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  imageTitle: {
    color: "#17243B",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  preview: {
    width: "100%",
    height: 190,
    backgroundColor: "#F8FAFD",
    borderRadius: 12,
  },
  noticeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  noticeTitle: {
    color: "#17243B",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  noticeText: {
    color: "#65738A",
    fontSize: 12,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#3974D8",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
