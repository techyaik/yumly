import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RADIUS, SPACING, FONTS } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

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
  const { colors } = useTheme();
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
    let interval: ReturnType<typeof setInterval> | null = null;
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
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, isCompleted && { backgroundColor: colors.elevated, opacity: 0.7 }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.stepBadge, { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent },
              isCompleted && { backgroundColor: colors.success, borderColor: colors.success },
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={12} color="white" />
            ) : (
              <Text style={[styles.stepText, { color: colors.primary }]}>{step}</Text>
            )}
          </View>
          <Text
            style={[styles.title, { color: colors.text }, isCompleted && { color: colors.textMuted, textDecorationLine: "line-through" }]}
          >
            Step {step}
          </Text>
        </View>

        {!readOnly && (
          <Pressable
            style={styles.completeToggle}
            onPress={toggleComplete}
          >
            <Ionicons
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={isCompleted ? colors.success : colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      <Text
        style={[styles.instructionText, { color: colors.text }, isCompleted && { color: colors.textMuted, textDecorationLine: "line-through" }]}
      >
        {text}
      </Text>

      {timerSeconds && !isCompleted && !readOnly && (
        <Pressable
          style={[styles.timerButton, isActive && { backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsActive(!isActive);
          }}
        >
          {isActive ? (
            <View style={[styles.timerBtnContent, { backgroundColor: colors.elevated }]}>
              <Ionicons name="pause" size={16} color={colors.text} />
              <Text style={[styles.timerBtnText, { color: colors.text }]}>
                Pause ({formatTime(timeLeft)})
              </Text>
            </View>
          ) : (
            <View style={[styles.timerBtnContent, { backgroundColor: colors.primary }]}>
              <Ionicons name="timer-outline" size={16} color={colors.inverseText} />
              <Text style={[styles.timerBtnText, { color: colors.inverseText }]}>
                Start Timer ({formatTime(timerSeconds)})
              </Text>
            </View>
          )}
        </Pressable>
      )}
    </View>
  );
}

export function ReadOnlyInstructionStep({ step, text }: { step: number; text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.stepBadge, { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent }]}>
            <Text style={[styles.stepText, { color: colors.primary }]}>{step}</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Step {step}</Text>
        </View>
      </View>
      <Text style={[styles.instructionText, { marginBottom: 0, color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.l,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: FONTS.mono,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  completeToggle: {
    padding: 2,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: SPACING.m,
  },
  timerButton: {
    borderRadius: RADIUS.m,
    overflow: "hidden",
  },
  timerBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.s + 2,
    gap: SPACING.s,
  },
  timerBtnText: {
    fontWeight: "700",
    fontSize: 13,
    fontFamily: FONTS.mono,
  },
});
