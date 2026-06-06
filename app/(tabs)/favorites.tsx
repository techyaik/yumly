import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../src/components/common/EmptyState";
import RecipeListItem from "../../src/components/recipe/RecipeListItem";
import SwipeableRow from "../../src/components/recipe/SwipeableRow";
import { FONTS, RADIUS, SPACING } from "../../src/constants/theme";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useTheme } from "../../src/context/ThemeContext";
import recipesData from "../../src/data/recipes.json";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

export default function FavoritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const router = useRouter();

  const favoriteRecipes = recipes.filter((recipe) =>
    favorites.includes(recipe.id)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <View
        style={styles.header}
      >
        <View>
          <Text style={[styles.headerLabel, { color: colors.primary }]}>YOUR COLLECTION</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Recipes</Text>
        </View>
        {favoriteRecipes.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.primaryLight, borderColor: colors.borderAccent }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{favoriteRecipes.length}</Text>
          </View>
        )}
      </View>

      {favoriteRecipes.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.list}>
            {favoriteRecipes.map((recipe, index) => (
              <View key={recipe.id}>
                <SwipeableRow
                  onDelete={() => toggleFavorite(recipe.id)}
                >
                  <RecipeListItem recipe={recipe} index={index} />
                </SwipeableRow>
              </View>
            ))}
          </View>
          <View style={styles.footerSpacer} />
        </ScrollView>
      ) : (
        <EmptyState
          icon="bookmark-outline"
          title="No Saved Recipes"
          description="Tap the heart icon on any recipe to save it here for quick access."
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
  },
  header: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
  countBadge: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: FONTS.mono,
  },
  scrollContent: {
    paddingTop: SPACING.s,
    paddingHorizontal: SPACING.m,
  },
  list: {
    width: "100%",
  },
  footerSpacer: {
    height: 100,
  },
});
