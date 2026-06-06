import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADIUS, SPACING, FONTS } from "../../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

const alertSound = require("../../../assets/sounds/alert.wav");
const successSound = require("../../../assets/sounds/success.wav");

interface Props {
  step: number;
  text: string;
  timerSeconds?: number;
  readOnly?: boolean;
}

export default function InstructionStep({
  step,
  text,
  timerSeconds,
  readOnly = false,
}: Props) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds || 0);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const player = useAudioPlayer(alertSound, { downloadFirst: true });
  const lastPlayedSource = useRef(alertSound);

  const playSound = React.useCallback(
    async (source = alertSound) => {
      try {
        if (!player) return;

        if (lastPlayedSource.current === source && player.isLoaded) {
          await player.seekTo(0);
          player.play();
        } else {
          await player.replace(source);
          player.play();
          lastPlayedSource.current = source;
        }
      } catch (error) {
        console.warn("Error playing instruction sound:", error);
      }
    },
    [player]
  );

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const prevTimeLeft = useRef(timeLeft);
  useEffect(() => {
    if (prevTimeLeft.current > 0 && timeLeft === 0 && !isActive) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound();
    }
    prevTimeLeft.current = timeLeft;
  }, [timeLeft, isActive, playSound]);

  const toggleComplete = () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    if (nextState) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound(successSound);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, isCompleted && styles.containerCompleted]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.stepBadge,
              isCompleted && styles.stepBadgeCompleted,
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <Text style={styles.stepText}>{step}</Text>
            )}
          </View>
          <Text
            style={[styles.title, isCompleted && styles.textCompleted]}
          >
            Step {step}
          </Text>
        </View>

        {!readOnly && (
          <Pressable
            style={[
              styles.completeToggle,
              isCompleted && styles.completeToggleActive,
            ]}
            onPress={toggleComplete}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={isCompleted ? COLORS.success : COLORS.textMuted}
            />
          </Pressable>
        )}
      </View>

      <Text
        style={[styles.instructionText, isCompleted && styles.textCompleted]}
      >
        {text}
      </Text>

      {timerSeconds && !isCompleted && !readOnly && (
        <Pressable
          style={[styles.timerButton, isActive && styles.timerActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsActive(!isActive);
          }}
        >
          {isActive ? (
            <View style={styles.timerBtnContent}>
              <Ionicons name="pause" size={16} color={COLORS.text} />
              <Text style={styles.timerBtnText}>
                Pause ({formatTime(timeLeft)})
              </Text>
            </View>
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.timerBtnContent}
            >
              <Ionicons name="timer-outline" size={16} color="#1A0E04" />
              <Text style={[styles.timerBtnText, { color: "#1A0E04" }]}>
                Start Timer ({formatTime(timerSeconds)})
              </Text>
            </LinearGradient>
          )}
        </Pressable>
      )}
    </View>
  );
}

export function ReadOnlyInstructionStep({ step, text }: { step: number; text: string }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{step}</Text>
          </View>
          <Text style={styles.title}>Step {step}</Text>
        </View>
      </View>
      <Text style={[styles.instructionText, { marginBottom: 0 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  containerCompleted: {
    backgroundColor: COLORS.elevated,
    borderColor: COLORS.border,
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.s,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  stepBadgeCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  stepText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    fontFamily: FONTS.mono,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  completeToggle: {
    padding: 2,
  },
  completeToggleActive: {
    opacity: 1,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.m,
  },
  textCompleted: {
    textDecorationLine: "line-through",
    color: COLORS.textMuted,
  },
  timerButton: {
    borderRadius: RADIUS.m,
    overflow: "hidden",
  },
  timerActive: {
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.s + 2,
    gap: SPACING.s,
  },
  timerBtnText: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 13,
    fontFamily: FONTS.mono,
  },
});
