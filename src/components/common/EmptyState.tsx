import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";
import Animated, { FadeIn } from "react-native-reanimated";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(600)} 
      style={styles.container}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={60} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionLabel && onAction && (
        <Pressable style={styles.actionBtn} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    marginTop: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.s,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.m,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
  },
  actionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
