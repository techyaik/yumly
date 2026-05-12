import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useFavorites } from "../../src/context/FavoritesContext";
import { Recipe } from "../../src/types";
import recipesData from "../../src/data/recipes.json";
import RecipeListItem from "../../src/components/recipe/RecipeListItem";
import SwipeableRow from "../../src/components/recipe/SwipeableRow";
import EmptyState from "../../src/components/common/EmptyState";
import { useRouter } from "expo-router";

const recipes = recipesData as Recipe[];

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  const favoriteRecipes = recipes.filter((recipe) => 
    favorites.includes(recipe.id)
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>
      {favoriteRecipes.length > 0 ? (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.list}>
            {favoriteRecipes.map((recipe, index) => (
              <SwipeableRow key={recipe.id} onDelete={() => toggleFavorite(recipe.id)}>
                <RecipeListItem recipe={recipe} index={index} />
              </SwipeableRow>
            ))}
          </View>
          <View style={styles.footerSpacer} />
        </ScrollView>
      ) : (
        <EmptyState 
          icon="heart-outline"
          title="No Favorites Yet"
          description="Your favorite recipes will appear here so you can find them easily."
          actionLabel="Explore Recipes"
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
  scrollContent: {
    paddingTop: SPACING.s,
    paddingHorizontal: SPACING.m,
  },
  list: {
    width: "100%",
  },
  footerSpacer: {
    height: 80,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
    marginTop: -100,
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
  },
});
