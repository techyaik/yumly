import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import CookingPot from "../../src/components/recipe/CookingPot";
import IngredientList from "../../src/components/recipe/IngredientList";
import { RADIUS, SHADOWS, SPACING, FONTS } from "../../src/constants/theme";
import { useMealPlan } from "../../src/context/MealPlanContext";
import { useUser } from "../../src/context/UserContext";
import { useTheme } from "../../src/context/ThemeContext";
import recipesData from "../../src/data/recipes.json";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

const alertSound = require("../../assets/sounds/alert.wav");
const successSound = require("../../assets/sounds/success.wav");
const startSound = require("../../assets/sounds/start.wav");

export default function CookingScreen() {
  const { id, servings: servingsParam } = useLocalSearchParams();
  const recipeId = Array.isArray(id) ? id[0] ?? "" : id ?? "";
  const router = useRouter();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { removeByRecipeId } = useMealPlan();
  const { incrementRecipesCooked } = useUser();
  const recipe = recipes.find((r) => r.id === recipeId);

  const initialServings = recipe?.metadata.servings || 4;
  const servings = servingsParam
    ? parseInt(
        Array.isArray(servingsParam) ? servingsParam[0] : servingsParam
      )
    : initialServings;

  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);

  const oneShotPlayer = useAudioPlayer(alertSound, { downloadFirst: true });
  const lastPlayedSource = useRef(alertSound);
  const timerStepRef = useRef<number | null>(null);

  const instructions = recipe?.instructions || [];
  const currentInstruction = instructions[currentStep];

  const playSound = React.useCallback(
    async (source = alertSound) => {
      try {
        if (!oneShotPlayer) return;

        if (lastPlayedSource.current === source && oneShotPlayer.isLoaded) {
          await oneShotPlayer.seekTo(0);
          oneShotPlayer.play();
        } else {
          await oneShotPlayer.replace(source);
          oneShotPlayer.play();
          lastPlayedSource.current = source;
        }
      } catch (error) {
        console.warn("Error playing one-shot sound:", error);
      }
    },
    [oneShotPlayer]
  );

  // TTS Logic
  const speakInstruction = React.useCallback(async () => {
    if (!currentInstruction?.text) return;

    try {
      const isCurrentlySpeaking = await Speech.isSpeakingAsync();
      if (isCurrentlySpeaking) {
        await Speech.stop();
      }

      setIsSpeaking(true);
      Speech.speak(currentInstruction.text, {
        language: "en-US",
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: (error) => {
          console.warn("Speech error:", error);
          setIsSpeaking(false);
        },
      });
    } catch (error) {
      console.warn("Speech error:", error);
      setIsSpeaking(false);
    }
  }, [currentInstruction?.text]);

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  // Lifecycle-safe Keep Awake
  useEffect(() => {
    async function toggleKeepAwake() {
      try {
        await activateKeepAwakeAsync();
      } catch (e) {
        console.warn("Failed to activate keep awake:", e);
      }
    }
    toggleKeepAwake();
    return () => {
      deactivateKeepAwake().catch(() => {});
      Speech.stop(); // Stop audio if user leaves
    };
  }, []);

  // Auto-read on step change
  useEffect(() => {
    speakInstruction();
  }, [currentStep, speakInstruction]);

  useEffect(() => {
    if (currentInstruction?.timerSeconds) {
      setTimeLeft(currentInstruction.timerSeconds);
      setIsTimerActive(false);
      timerStepRef.current = currentStep;
    } else {
      setTimeLeft(0);
      setIsTimerActive(false);
      timerStepRef.current = null;
    }
  }, [currentStep, currentInstruction?.timerSeconds]);

  // Effect for handling the 1-second countdown interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft]);

  const handleFinish = React.useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound(successSound);
    if (recipe) {
      removeByRecipeId(recipe.id);
      incrementRecipesCooked();
    }
    setShowSuccess(true);
  }, [playSound, recipe, removeByRecipeId, incrementRecipesCooked]);

  // Handle timer completion (haptics and completion sound)
  const prevTimeLeft = useRef(timeLeft);
  useEffect(() => {
    const hadTimer = timerStepRef.current !== null;
    if (
      hadTimer &&
      prevTimeLeft.current > 0 &&
      timeLeft === 0 &&
      !isTimerActive
    ) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound(alertSound);

      // If this was the last step and it had a timer, trigger the finish dialog
      if (currentStep === instructions.length - 1) {
        handleFinish();
      }
    }
    prevTimeLeft.current = timeLeft;
  }, [
    timeLeft,
    isTimerActive,
    currentStep,
    instructions.length,
    playSound,
    handleFinish,
  ]);

  if (!recipe) return null;

  const totalSteps = instructions.length;
  const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps : 0;

  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound();
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
          <Ionicons name="close" size={20} color={colors.textMuted} />
        </Pressable>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: colors.textMuted }]}>
              STEP {currentStep + 1}/{instructions.length}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={StyleSheet.flatten([styles.progressFill, { width: `${progress * 100}%` }])}
              />
            </View>
          </View>
        <Pressable
          style={[styles.ingredientsBtn, { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowIngredients(true);
          }}
        >
          <Ionicons name="list" size={16} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.mainContent}>
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View
            key={`step-${currentStep}`}
            style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
          <View style={styles.instructionHeaderRow}>
            <Text style={[styles.instructionLabel, { color: colors.primary }]}>INSTRUCTION</Text>
            <Pressable
              onPress={isSpeaking ? stopSpeaking : speakInstruction}
              style={StyleSheet.flatten([
                styles.speakerBtn,
                { backgroundColor: colors.elevated, borderColor: colors.border },
                isSpeaking && { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent },
              ])}
            >
              <Ionicons
                name={isSpeaking ? "volume-high" : "volume-medium-outline"}
                size={20}
                color={isSpeaking ? colors.primary : colors.textMuted}
              />
            </Pressable>
          </View>
          <Text style={[styles.instructionText, { color: colors.text }]}>
            {currentInstruction?.text || ""}
          </Text>
          </View>

          {currentInstruction?.timerSeconds ? (
            <View style={styles.timerSection}>
              <CookingPot
                isActive={isTimerActive}
                timeLeft={timeLeft}
                formatTime={formatTime}
              />

              <Pressable
                style={styles.timerToggle}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (!isTimerActive) playSound(startSound);
                  setIsTimerActive(!isTimerActive);
                }}
              >
                {isTimerActive ? (
                  <View style={[styles.timerToggleInner, { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border, borderRadius: RADIUS.m }]}>
                    <Ionicons name="pause" size={20} color={colors.text} />
                    <Text style={[styles.timerToggleText, { color: colors.text }]}>Pause Timer</Text>
                  </View>
                ) : (
                  <View style={[styles.timerToggleInner, { backgroundColor: colors.primary }]}>
                    <Ionicons name="play" size={20} color={colors.inverseText} />
                    <Text
                      style={StyleSheet.flatten([styles.timerToggleText, { color: colors.inverseText }])}
                    >
                      Start Timer
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.noTimerSection}>
              <CookingPot
                isActive={false}
                timeLeft={0}
                formatTime={() => "0:00"}
              />
          <Text style={[styles.noTimerText, { color: colors.textMuted }]}>
            Follow the instruction above to prepare your dish.
          </Text>
            </View>
          )}

          {/* Spacer to prevent overlap with footer when scrolled to bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Fixed Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: insets.bottom }]}>
          <Pressable
            style={StyleSheet.flatten([
              styles.navBtn,
              currentStep === 0 && styles.navBtnDisabled,
            ])}
            onPress={handleBack}
            disabled={currentStep === 0}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={currentStep === 0 ? colors.textMuted : colors.text}
            />
            <Text
              style={StyleSheet.flatten([
                styles.navBtnText,
                { color: colors.text },
                currentStep === 0 && { color: colors.textMuted },
              ])}
            >
              Back
            </Text>
          </Pressable>

          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <View
              style={[
                styles.nextBtnGradient,
                {
                  backgroundColor:
                    currentStep === instructions.length - 1
                      ? colors.success
                      : colors.primary,
                },
              ]}
            >
              <Text style={styles.nextBtnText}>
                {currentStep === instructions.length - 1
                  ? "Finish"
                  : "Next Step"}
              </Text>
              {currentStep < instructions.length - 1 ? (
                <Ionicons name="chevron-forward" size={18} color={colors.inverseText} />
              ) : (
                <Ionicons name="checkmark" size={18} color={colors.inverseText} />
              )}
            </View>
          </Pressable>
        </View>
      </View>

      {/* Ingredients Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showIngredients}
        onRequestClose={() => setShowIngredients(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.bg3 }]} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalLabel, { color: colors.primary }]}>REFERENCE</Text>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Ingredients</Text>
              </View>
              <Pressable
                style={[styles.modalCloseBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                onPress={() => setShowIngredients(false)}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <IngredientList
                ingredients={recipe.ingredients}
                initialServings={initialServings}
                currentServings={servings}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Celebration Modal */}
      <Modal animationType="fade" transparent={true} visible={showSuccess}>
        <View style={styles.successOverlay}>
          <View
            style={[styles.successContent, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.successIconCircle, { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent }]}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Bon Appétit!</Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
              You&apos;ve finished cooking {recipe.title}. The recipe has been
              removed from your meal plan.
            </Text>

            <View style={styles.successActions}>
              <Pressable
                style={styles.successHomeBtn}
                onPress={() => {
                  setShowSuccess(false);
                  router.push("/(tabs)");
                }}
              >
                <View style={[styles.successHomeBtnGradient, { backgroundColor: colors.primary }]}>
                  <Ionicons name="home-outline" size={18} color={colors.inverseText} />
                  <Text style={[styles.successHomeText, { color: colors.inverseText }]}>Back to Home</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.successPlanBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                onPress={() => {
                  setShowSuccess(false);
                  router.push("/(tabs)/mealplan");
                }}
              >
                <Text style={[styles.successPlanText, { color: colors.primary }]}>View Meal Plan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    
    height: 56,
  },
  mainContent: {
    flex: 1,
    position: "relative",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.m,
    paddingBottom: 20,
    flexGrow: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

  },
  progressHeader: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: SPACING.m,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "800",

    marginBottom: 4,
    letterSpacing: 2,
    fontFamily: FONTS.mono,
  },
  progressBar: {
    width: 120,
    height: 4,

    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",

    borderRadius: 2,
  },
  ingredientsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

  },
  // Modal
  modalOverlay: {
    flex: 1,

    justifyContent: "flex-end",
  },
  modalContent: {

    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.l,
    maxHeight: "80%",
    borderWidth: 1,
    borderBottomWidth: 0,

  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,

    alignSelf: "center",
    marginBottom: SPACING.l,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",

    fontFamily: FONTS.serif,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

  },
  // Instruction
  instructionCard: {

    padding: SPACING.l,
    borderRadius: RADIUS.l,
    minHeight: 140,
    borderWidth: 1,

  },
  instructionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  speakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

  },
  speakerBtnActive: {


  },
  instructionLabel: {
    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 2,
    fontFamily: FONTS.mono,
  },
  instructionText: {
    fontSize: 17,
    fontWeight: "600",

    lineHeight: 26,
  },
  // Timer
  timerSection: {
    marginTop: SPACING.xl,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: SPACING.xl,
  },
  timerToggle: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    minWidth: 180,
    ...SHADOWS.glow,
  },
  timerToggleInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.s + 4,
    gap: SPACING.s,
  },
  timerToggleText: {
    fontWeight: "800",
    fontSize: 15,
  },
  noTimerSection: {
    marginTop: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl,
  },
  noTimerText: {
    textAlign: "center",

    fontSize: 14,
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
  // Footer
  footer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderTopWidth: 1,
    
    alignItems: "center",
    justifyContent: "space-between",

    width: "100%",
  },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.s,
    gap: 4,
  },
  navBtnDisabled: {
    opacity: 0.2,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: "700",

  },
  navBtnTextDisabled: {

  },
  nextBtn: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    minWidth: 140,
    ...SHADOWS.glow,
  },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.s + 4,
    gap: 6,
  },
  nextBtnText: {

    fontSize: 14,
    fontWeight: "800",
  },
  // Success
  successOverlay: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  successContent: {

    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,

  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,

    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.l,
    borderWidth: 2,

  },
  successEmoji: {
    fontSize: 44,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",

    marginBottom: SPACING.s,
    fontFamily: FONTS.serif,
  },
  successSubtitle: {
    fontSize: 14,

    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  successActions: {
    width: "100%",
  },
  successHomeBtn: {
    borderRadius: RADIUS.l,
    overflow: "hidden",
    marginBottom: SPACING.s,
    ...SHADOWS.glow,
  },
  successHomeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  successHomeText: {

    fontSize: 15,
    fontWeight: "800",
  },
  successPlanBtn: {
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.l,
    alignItems: "center",

    borderWidth: 1,

  },
  successPlanText: {

    fontSize: 15,
    fontWeight: "700",
  },
});
