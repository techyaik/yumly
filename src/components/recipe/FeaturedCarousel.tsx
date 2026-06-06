import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RecipeImages } from "../../constants/recipe-images";
import { FONTS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import { Recipe } from "../../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - SPACING.m * 2;
const CARD_HEIGHT = 200;

interface FeaturedCarouselProps {
  recipes: Recipe[];
}

export default function FeaturedCarousel({ recipes }: FeaturedCarouselProps) {
  const flatListRef = useRef<FlatList>(null);
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  // Take top 5 featured recipes
  const featured = recipes.slice(0, 5);

  const onScroll = (event: any) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING.s)
    );
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>FEATURED</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Chef{"'"}s Picks</Text>
        </View>
        <View style={styles.paginationDots}>
          {featured.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: colors.bg3 }, i === activeIndex && { width: 20, backgroundColor: colors.primary }]}
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={featured}
        horizontal
        pagingEnabled
        snapToInterval={CARD_WIDTH + SPACING.s}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => `featured-${item.id}`}
        renderItem={({ item, index }) => (
          <Link href={`/recipe/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <View
                style={[styles.cardInner, { borderColor: colors.border }]}
              >
                <Image
                  source={RecipeImages[item.id]}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={400}
                />
                <View style={[styles.cardGradient, { backgroundColor: "rgba(0,0,0,0.5)" }]} />
                
                {/* Category tag */}
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{item.category}</Text>
                </View>

                {/* Content overlay */}
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: "#F5F0EB" }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.cardSummary, { color: "rgba(245,240,235,0.7)" }]} numberOfLines={1}>
                    {item.summary}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color={colors.primary} />
                      <Text style={[styles.metaText, { color: "rgba(245,240,235,0.8)" }]}>
                        {item.metadata.prepTimeMinutes} min
                      </Text>
                    </View>
                    <View style={[styles.metaDot, { backgroundColor: "rgba(245,240,235,0.3)" }]} />
                    <View style={styles.metaItem}>
                      <Ionicons name="flame-outline" size={13} color={colors.primary} />
                      <Text style={[styles.metaText, { color: "rgba(245,240,235,0.8)" }]}>
                        {item.metadata.calories} cal
                      </Text>
                    </View>
                    <View style={[styles.metaDot, { backgroundColor: "rgba(245,240,235,0.3)" }]} />
                    <View style={styles.metaItem}>
                      <Ionicons name="people-outline" size={13} color={colors.primary} />
                      <Text style={[styles.metaText, { color: "rgba(245,240,235,0.8)" }]}>
                        {item.metadata.servings}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.s,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.m,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: FONTS.serif,
  },
  paginationDots: {
    flexDirection: "row",
    gap: 5,
    paddingBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  listContent: {
    paddingHorizontal: SPACING.m,
    gap: SPACING.s,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardInner: {
    flex: 1,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryTag: {
    position: "absolute",
    top: SPACING.m,
    left: SPACING.m,
    backgroundColor: "rgba(232, 168, 56, 0.9)",
    paddingHorizontal: SPACING.s + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1A0E04",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.m,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.3,
    fontFamily: FONTS.serif,
  },
  cardSummary: {
    fontSize: 12,
    marginBottom: SPACING.s,
    lineHeight: 16,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: FONTS.mono,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: SPACING.s,
  },
});
