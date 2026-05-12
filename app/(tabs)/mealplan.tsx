import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMealPlan } from "../../src/context/MealPlanContext";
import { Recipe } from "../../src/types";
import recipesData from "../../src/data/recipes.json";
import { Image } from "expo-image";
import { RecipeImages } from "../../src/constants/recipe-images";
import { Link, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight } from "react-native-reanimated";
import EmptyState from "../../src/components/common/EmptyState";

const recipes = recipesData as Recipe[];

export default function MealPlanScreen() {
  const { meals, removeFromMealPlan } = useMealPlan();
  const router = useRouter();

  const getRecipeById = (id: string) => recipes.find(r => r.id === id);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Plan</Text>
      </View>

      {meals.length > 0 ? (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionSubtitle}>UPCOMING MEALS</Text>
          {meals.map((meal, index) => {
            const recipe = getRecipeById(meal.recipeId);
            if (!recipe) return null;

            return (
              <Animated.View 
                key={meal.id} 
                entering={FadeInRight.delay(index * 100)}
                style={styles.mealCard}
              >
                <Link href={`/recipe/${meal.recipeId}`} asChild>
                  <Pressable style={styles.mealInner}>
                    <Image
                      source={RecipeImages[meal.recipeId]}
                      style={styles.mealImage}
                      contentFit="cover"
                    />
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealTitle} numberOfLines={1}>{recipe.title}</Text>
                      <View style={styles.servingsRow}>
                        <Ionicons name="people" size={14} color={COLORS.primary} />
                        <Text style={styles.servingsText}>
                          {meal.servings} {meal.servings === 1 ? "Member" : "Members"}
                        </Text>
                      </View>
                      <View style={styles.proportionTag}>
                        <Text style={styles.proportionText}>
                          x{(meal.servings / recipe.metadata.servings).toFixed(1)} Proportion
                        </Text>
                      </View>
                    </View>
                    <Pressable 
                      style={styles.removeBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeFromMealPlan(meal.id);
                      }}
                    >
                      <Ionicons name="close-circle" size={24} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
                    </Pressable>
                  </Pressable>
                </Link>
                
                {/* Actions Section - Explicitly outside the detail link */}
                <View style={styles.cardActions}>
                  <Pressable 
                    style={styles.startCookingBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      router.push({
                        pathname: `/cooking/${meal.recipeId}`,
                        params: { servings: meal.servings }
                      });
                    }}
                  >
                    <Ionicons name="play" size={16} color={COLORS.text} />
                    <Text style={styles.startCookingText}>Start Cooking</Text>
                  </Pressable>
                </View>
              </Animated.View>
            );
          })}
          <View style={styles.footerSpacer} />
        </ScrollView>
      ) : (
        <EmptyState 
          icon="restaurant-outline"
          title="Your Plan is Empty"
          description="Choose a recipe and add it to your daily plan to start your cooking journey."
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.m,
  },
  scrollContent: {
    paddingTop: SPACING.s,
  },
  mealCard: {
    marginHorizontal: SPACING.m,
    marginBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.l,
    ...SHADOWS.small,
    overflow: "hidden",
  },
  mealInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.s,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.m,
  },
  mealInfo: {
    flex: 1,
    paddingHorizontal: SPACING.m,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  servingsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  proportionTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  proportionText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  removeBtn: {
    padding: SPACING.s,
  },
  cardActions: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.m,
  },
  startCookingBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.m,
    ...SHADOWS.small,
  },
  startCookingText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  footerSpacer: {
    height: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    marginTop: -100,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.m,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.s,
    lineHeight: 24,
  },
});
