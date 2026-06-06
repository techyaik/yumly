import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { RADIUS, SPACING, FONTS } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

import { Ingredient } from "../../types";

interface Props {
  ingredients: Ingredient[];
  initialServings: number;
  currentServings?: number;
}

export default function IngredientList({
  ingredients,
  initialServings,
  currentServings,
}: Props) {
  const [servings, setServings] = useState(currentServings || initialServings);
  const { colors } = useTheme();

  const scale = servings / initialServings;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>WHAT YOU NEED</Text>
          <Text style={[styles.title, { color: colors.text }]}>Ingredients</Text>
        </View>
        <View style={[styles.servingsControl, { backgroundColor: colors.elevated, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setServings(Math.max(1, servings - 1))}
            style={[styles.controlBtn, { backgroundColor: colors.bg3 }]}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </Pressable>
          <Text style={[styles.servingsText, { color: colors.text }]}>{servings}</Text>
          <Pressable
            onPress={() => setServings(servings + 1)}
            style={[styles.controlBtn, { backgroundColor: colors.bg3 }]}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.list}>
        {ingredients.map((item, index) => (
          <View
            key={index}
            style={[styles.ingredientRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.elevated }]}>
              <Text style={[styles.initial, { color: colors.primary }]}>
                {getInitial(item.name)}
              </Text>
            </View>
            <View style={styles.details}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.quantity, { color: colors.textMuted }]}>
                {(item.quantity * scale).toFixed(
                  item.quantity % 1 === 0 ? 0 : 1
                )}{" "}
                {item.unit}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.l,
    paddingHorizontal: SPACING.m,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: SPACING.m,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: FONTS.serif,
  },
  servingsControl: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.m,
    padding: SPACING.xs,
    borderWidth: 1,
  },
  controlBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  servingsText: {
    marginHorizontal: SPACING.m,
    fontWeight: "800",
    fontSize: 15,
    fontFamily: FONTS.mono,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  ingredientRow: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.s + 2,
    padding: SPACING.s + 2,
    borderRadius: RADIUS.m,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.s,
  },
  initial: {
    fontSize: 14,
    fontWeight: "700",
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  quantity: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: FONTS.mono,
  },
});
