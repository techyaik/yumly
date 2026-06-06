import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
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
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import CookingPot from "../../src/components/recipe/CookingPot";
import { COLORS, RADIUS, SHADOWS, SPACING, FONTS } from "../../src/constants/theme";
import { useMealPlan } from "../../src/context/MealPlanContext";
import recipesData from "../../src/data/recipes.json";
import { useUser } from "../../src/context/UserContext";
import IngredientList from "../../src/components/recipe/IngredientList";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

const alertSound = require("../../assets/sounds/alert.wav");
const successSound = require("../../assets/sounds/success.wav");
const startSound = require("../../assets/sounds/start.wav");

export default function CookingScreen() {
  const { id, servings: servingsParam } = useLocalSearchParams();
  const recipeId = Array.isArray(id) ? id[0] ?? "" : id ?? "";
  const router = useRouter();
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
    let interval: number | null = null;

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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={20} color={COLORS.textMuted} />
        </Pressable>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              STEP {currentStep + 1}/{instructions.length}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View
                style={StyleSheet.flatten([styles.progressFill, { width: `${progress * 100}%` }])}
              />
            </View>
          </View>
        <Pressable
          style={styles.ingredientsBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowIngredients(true);
          }}
        >
          <Ionicons name="list" size={16} color={COLORS.primary} />
        </Pressable>
      </View>

      <View style={styles.mainContent}>
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={`step-${currentStep}`}
            entering={FadeIn.duration(400)}
            style={styles.instructionCard}
          >
            <View style={styles.instructionHeaderRow}>
              <Text style={styles.instructionLabel}>INSTRUCTION</Text>
              <Pressable
                onPress={isSpeaking ? stopSpeaking : speakInstruction}
                style={StyleSheet.flatten([
                  styles.speakerBtn,
                  isSpeaking && styles.speakerBtnActive,
                ])}
              >
                <Ionicons
                  name={isSpeaking ? "volume-high" : "volume-medium-outline"}
                  size={20}
                  color={isSpeaking ? COLORS.primary : COLORS.textMuted}
                />
              </Pressable>
            </View>
            <Text style={styles.instructionText}>
              {currentInstruction?.text || ""}
            </Text>
          </Animated.View>

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
                  <View style={styles.timerToggleInner}>
                    <Ionicons name="pause" size={20} color={COLORS.text} />
                    <Text style={styles.timerToggleText}>Pause Timer</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.timerToggleInner}
                  >
                    <Ionicons name="play" size={20} color="#1A0E04" />
                    <Text
                      style={StyleSheet.flatten([styles.timerToggleText, { color: "#1A0E04" }])}
                    >
                      Start Timer
                    </Text>
                  </LinearGradient>
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
              <Text style={styles.noTimerText}>
                Follow the instruction above to prepare your dish.
              </Text>
            </View>
          )}

          {/* Spacer to prevent overlap with footer when scrolled to bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Fixed Footer */}
        <View style={styles.footer}>
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
              color={currentStep === 0 ? COLORS.textMuted : COLORS.text}
            />
            <Text
              style={StyleSheet.flatten([
                styles.navBtnText,
                currentStep === 0 && styles.navBtnTextDisabled,
              ])}
            >
              Back
            </Text>
          </Pressable>

          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <LinearGradient
              colors={
                currentStep === instructions.length - 1
                  ? [COLORS.success, "#6B9B6B"]
                  : [COLORS.primary, COLORS.primaryDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextBtnGradient}
            >
              <Text style={styles.nextBtnText}>
                {currentStep === instructions.length - 1
                  ? "Finish"
                  : "Next Step"}
              </Text>
              {currentStep < instructions.length - 1 ? (
                <Ionicons name="chevron-forward" size={18} color="#1A0E04" />
              ) : (
                <Ionicons name="checkmark" size={18} color="#1A0E04" />
              )}
            </LinearGradient>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalLabel}>REFERENCE</Text>
                <Text style={styles.modalTitle}>Ingredients</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setShowIngredients(false)}
              >
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
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
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.successContent}
          >
            <View style={styles.successIconCircle}>
              <Text style={styles.successEmoji}>🎉</Text>
            </View>
            <Text style={styles.successTitle}>Bon Appétit!</Text>
            <Text style={styles.successSubtitle}>
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
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.successHomeBtnGradient}
                >
                  <Ionicons name="home-outline" size={18} color="#1A0E04" />
                  <Text style={styles.successHomeText}>Back to Home</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={styles.successPlanBtn}
                onPress={() => {
                  setShowSuccess(false);
                  router.push("/(tabs)/mealplan");
                }}
              >
                <Text style={styles.successPlanText}>View Meal Plan</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    backgroundColor: COLORS.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressHeader: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: SPACING.m,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    marginBottom: 4,
    letterSpacing: 2,
    fontFamily: FONTS.mono,
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: COLORS.bg3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  ingredientsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.l,
    maxHeight: "80%",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.border,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.bg3,
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
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Instruction
  instructionCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.l,
    borderRadius: RADIUS.l,
    minHeight: 140,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  speakerBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.borderAccent,
  },
  instructionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 2,
    fontFamily: FONTS.mono,
  },
  instructionText: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
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
    color: COLORS.textMuted,
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
    borderTopColor: COLORS.border,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.card,
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
    color: COLORS.text,
  },
  navBtnTextDisabled: {
    color: COLORS.textMuted,
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
    color: "#1A0E04",
    fontSize: 14,
    fontWeight: "800",
  },
  // Success
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  successContent: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.l,
    borderWidth: 2,
    borderColor: COLORS.borderAccent,
  },
  successEmoji: {
    fontSize: 44,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: SPACING.s,
    fontFamily: FONTS.serif,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: "#1A0E04",
    fontSize: 15,
    fontWeight: "800",
  },
  successPlanBtn: {
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.l,
    alignItems: "center",
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successPlanText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
