import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, RADIUS, FONTS } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

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
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View
        style={[styles.iconCircle, { backgroundColor: colors.elevated, borderColor: colors.border }]}
      >
        <View style={[styles.iconInner, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name={icon} size={40} color={colors.primary} />
        </View>
      </View>

      <View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      <View>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      </View>

      {actionLabel && onAction && (
        <View>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onAction}>
            <Text style={[styles.actionText, { color: colors.inverseText }]}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.inverseText} />
          </Pressable>
        </View>
      )}
    </View>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.l,
    borderWidth: 1,
  },
  iconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.s,
    fontFamily: FONTS.serif,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.m,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.l,
    gap: SPACING.s,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
