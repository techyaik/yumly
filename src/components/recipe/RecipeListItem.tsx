import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { RecipeImages } from "../../constants/recipe-images";
import { useFavorites } from "../../context/FavoritesContext";
import * as Haptics from "expo-haptics";
import { RecipeSummary } from "./RecipeCard";

const RecipeListItem = React.memo(({
  recipe,
  index,
}: {
  recipe: RecipeSummary;
  index: number;
}) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  return (
    <Link href={`/recipe/${recipe.id}`} asChild>
      <Pressable style={styles.container}>
        <Animated.View
          entering={FadeInDown.delay(index * 50).duration(400)}
          style={styles.inner}
        >
          <View style={styles.thumbnailContainer}>
            <Image
              source={RecipeImages[recipe.id]}
              style={styles.thumbnail}
              contentFit="cover"
              transition={300}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {recipe.title}
              </Text>
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.statText}>{recipe.metadata.prepTimeMinutes} min</Text>
                </View>
                <View style={styles.dot} />
                <View style={styles.statItem}>
                  <Ionicons name="filter-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.statText}>{recipe.metadata.difficulty}</Text>
                </View>
              </View>
            </View>

            <Pressable 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleFavorite(recipe.id);
              }}
            >
              <Ionicons 
                name={favorited ? "heart" : "heart-outline"} 
                size={22} 
                color={favorited ? COLORS.error : COLORS.textSecondary} 
              />
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Link>
  );
});

RecipeListItem.displayName = "RecipeListItem";

export default RecipeListItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.m,
    ...SHADOWS.small,
  },
  inner: {
    flexDirection: "row",
    padding: SPACING.s,
    alignItems: "center",
  },
  thumbnailContainer: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.s,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
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
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: SPACING.s,
    opacity: 0.3,
  },
  favoriteButton: {
    padding: SPACING.s,
  },
});
