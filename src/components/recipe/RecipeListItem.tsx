import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RecipeImages } from "../../constants/recipe-images";
import { FONTS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { useFavorites } from "../../context/FavoritesContext";
import { useTheme } from "../../context/ThemeContext";
import { RecipeSummary } from "./RecipeCard";

const RecipeListItem = React.memo(
  ({
    recipe,
    index,
  }: {
    recipe: RecipeSummary;
    index: number;
  }) => {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { colors } = useTheme();
    const favorited = isFavorite(recipe.id);

    return (
      <Link href={`/recipe/${recipe.id}`} asChild>
        <Pressable style={StyleSheet.flatten([styles.container, { backgroundColor: colors.card, borderColor: colors.border }])}>
          <View
            style={styles.inner}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              <Image
                source={RecipeImages[recipe.id]}
                style={styles.thumbnail}
                contentFit="cover"
                transition={300}
              />
              {/* Veg indicator */}
              <View
                style={[
                  styles.vegDot,
                  {
                    backgroundColor: recipe.isVeg
                      ? colors.veg
                      : colors.nonVeg,
                  },
                ]}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                  {recipe.title}
                </Text>
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="time-outline"
                      size={13}
                      color={colors.primary}
                    />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                      {recipe.metadata.prepTimeMinutes} min
                    </Text>
                  </View>
                  <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.difficultyPill, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                      {recipe.metadata.difficulty}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={[
                  styles.favoriteButton,
                  { backgroundColor: colors.elevated, borderColor: colors.border },
                  favorited && { backgroundColor: "rgba(232, 93, 93, 0.1)", borderColor: "rgba(232, 93, 93, 0.2)" },
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleFavorite(recipe.id);
                }}
              >
                <Ionicons
                  name={favorited ? "heart" : "heart-outline"}
                  size={18}
                  color={favorited ? colors.error : colors.textMuted}
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Link>
    );
  }
);

RecipeListItem.displayName = "RecipeListItem";

export default RecipeListItem;

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.l,
    borderWidth: 1,
    ...SHADOWS.small,
  },
  inner: {
    flexDirection: "row",
    padding: SPACING.s + 2,
    alignItems: "center",
  },
  thumbnailContainer: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.m,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  vegDot: {
    position: "absolute",
    bottom: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.3)",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: SPACING.m,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.s,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: FONTS.mono,
    fontWeight: "500",
  },
  difficultyPill: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: SPACING.s,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
