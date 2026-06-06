import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../src/components/common/EmptyState";
import { RecipeImages } from "../../src/constants/recipe-images";
import { FONTS, RADIUS, SHADOWS, SPACING } from "../../src/constants/theme";
import { useMealPlan } from "../../src/context/MealPlanContext";
import { useTheme } from "../../src/context/ThemeContext";
import recipesData from "../../src/data/recipes.json";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

export default function MealPlanScreen() {
  const { meals, removeFromMealPlan } = useMealPlan();
  const { colors } = useTheme();
  const router = useRouter();

  const getRecipeById = (id: string) => recipes.find((r) => r.id === id);

  const totalCalories = meals.reduce((sum, meal) => {
    const recipe = getRecipeById(meal.recipeId);
    if (!recipe) return sum;
    const scale = meal.servings / recipe.metadata.servings;
    return sum + recipe.metadata.calories * scale;
  }, 0);

  const totalTime = meals.reduce((sum, meal) => {
    const recipe = getRecipeById(meal.recipeId);
    return sum + (recipe?.metadata.totalTimeMinutes || 0);
  }, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerLabel, { color: colors.primary }]}>YOUR KITCHEN</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Meal Plan</Text>
        </View>
      </View>

      {meals.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Stats */}
          <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.elevated }]}>
              <Ionicons name="flame-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{meals.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Recipes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.elevated }]}>
              <Ionicons name="nutrition-outline" size={18} color={colors.secondary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(totalCalories)}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Cal</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIconWrap, { backgroundColor: colors.elevated }]}>
              <Ionicons name="time-outline" size={18} color={colors.accentCool} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalTime}m</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Cook Time</Text>
          </View>
          </View>

          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>UPCOMING MEALS</Text>
          
          {meals.map((meal, index) => {
            const recipe = getRecipeById(meal.recipeId);
            if (!recipe) return null;

            return (
              <View
                key={meal.id}
                style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Link href={`/recipe/${meal.recipeId}`} asChild>
                  <Pressable style={styles.mealInner}>
                    {/* Image with subtle gradient */}
                    <View style={styles.mealImageWrap}>
                      <Image
                        source={RecipeImages[meal.recipeId]}
                        style={styles.mealImage}
                        contentFit="cover"
                      />
                    </View>

                    <View style={styles.mealInfo}>
                      <Text style={[styles.mealTitle, { color: colors.text }]} numberOfLines={1}>
                        {recipe.title}
                      </Text>
                      <View style={styles.mealMeta}>
                        <View style={styles.metaChip}>
                          <Ionicons
                            name="people"
                            size={12}
                            color={colors.primary}
                          />
                          <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                            {meal.servings}{" "}
                            {meal.servings === 1 ? "person" : "people"}
                          </Text>
                        </View>
                        <View style={[styles.proportionChip, { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent }]}>
                          <Text style={[styles.proportionText, { color: colors.primary }]}>
                            x{(meal.servings / recipe.metadata.servings).toFixed(1)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      style={[styles.removeBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeFromMealPlan(meal.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={colors.textMuted}
                      />
                    </Pressable>
                  </Pressable>
                </Link>

                {/* Cook Button */}
                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.startCookingBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push({
                        pathname: "/cooking/[id]",
                        params: { id: meal.recipeId, servings: meal.servings },
                      });
                    }}
                  >
                    <View style={[styles.cookBtnGradient, { backgroundColor: colors.primary }]}>
                      <Ionicons name="play" size={14} color={colors.inverseText} />
                      <Text style={[styles.startCookingText, { color: colors.inverseText }]}>Start Cooking</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            );
          })}
          <View style={styles.footerSpacer} />
        </ScrollView>
      ) : (
        <EmptyState
          icon="flame-outline"
          title="Your Kitchen is Empty"
          description="Browse recipes and add them to your meal plan to start your culinary adventure."
          actionLabel="Find Recipes"
          onAction={() => router.push("/(tabs)")}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: FONTS.serif,
  },
  scrollContent: {
    paddingTop: SPACING.s,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.m,
    gap: SPACING.s,
    marginBottom: SPACING.l,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.l,
    padding: SPACING.m,
    alignItems: "center",
    borderWidth: 1,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.s,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: FONTS.mono,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.m,
    fontFamily: FONTS.mono,
  },
  // Meal cards
  mealCard: {
    marginHorizontal: SPACING.m,
    marginBottom: SPACING.m,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    ...SHADOWS.small,
  },
  mealInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.s + 2,
  },
  mealImageWrap: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.m,
    overflow: "hidden",
  },
  mealImage: {
    width: "100%",
    height: "100%",
  },
  mealInfo: {
    flex: 1,
    paddingHorizontal: SPACING.m,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  mealMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  proportionChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  proportionText: {
    fontSize: 10,
    fontWeight: "800",
    fontFamily: FONTS.mono,
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  cardActions: {
    paddingHorizontal: SPACING.s + 2,
    paddingBottom: SPACING.s + 2,
  },
  startCookingBtn: {
    borderRadius: RADIUS.m,
    overflow: "hidden",
  },
  cookBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.s + 2,
    gap: 6,
  },
  startCookingText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  footerSpacer: {
    height: 120,
  },
});
