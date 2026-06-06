import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RADIUS, SPACING } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

interface CategoryBarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryBarProps) {
  const { colors } = useTheme();
  const handleSelect = (category: string) => {
    if (category !== selectedCategory) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelectCategory(category);
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category, index) => {
        const isActive = category === selectedCategory;

        return (
          <View key={category}>
            <Pressable
              onPress={() => handleSelect(category)}
              style={StyleSheet.flatten([
                styles.pill,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isActive && { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.pillText,
                  { color: colors.textMuted },
                  isActive && { color: colors.primary, fontWeight: "700" },
                ])}
              >
                {category}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    gap: SPACING.s,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
