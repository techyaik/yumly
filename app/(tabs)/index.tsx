import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptyState from "../../src/components/common/EmptyState";
import SpatulaIcon from "../../src/components/common/SpatulaIcon";
import CategoryBar from "../../src/components/recipe/CategoryBar";
import FeaturedCarousel from "../../src/components/recipe/FeaturedCarousel";
import RecipeCard from "../../src/components/recipe/RecipeCard";
import SearchBar from "../../src/components/recipe/SearchBar";
import { COLORS, FONTS, RADIUS, SPACING } from "../../src/constants/theme";
import { useUser } from "../../src/context/UserContext";
import recipesData from "../../src/data/recipes.json";
import { useDebounce } from "../../src/hooks/useDebounce";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

const CATEGORIES = [
  "All",
  "Breakfast",
  "Snacks",
  "Main Course",
  "Desserts",
  "Italian",
  "Mexican",
  "Chinese",
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: "Night owl?", emoji: "🌙" };
  if (hour < 12) return { text: "Good morning", emoji: "☀️" };
  if (hour < 17) return { text: "Good afternoon", emoji: "🌤️" };
  if (hour < 21) return { text: "Good evening", emoji: "🌅" };
  return { text: "Late night cravings?", emoji: "🌙" };
};

export default function HomeScreen() {
  const { name } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const saved = await AsyncStorage.getItem("recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load recent searches", e);
      }
    };
    loadRecentSearches();
  }, []);

  const addToRecentSearches = async (query: string) => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    
    const updated = [cleanQuery, ...recentSearches.filter(s => s !== cleanQuery)].slice(0, 5);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem("recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save recent searches", e);
    }
  };

  const removeRecentSearch = async (query: string) => {
    const updated = recentSearches.filter(s => s !== query);
    setRecentSearches(updated);
    try {
      await AsyncStorage.setItem("recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.warn("Failed to save recent searches", e);
    }
  };

  const greeting = getTimeGreeting();

  const filteredRecipes = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    const queryTerms = query.split(/\s+/).filter((term) => term.length > 0);

    return recipes.filter((recipe) => {
      const matchesCategory =
        selectedCategory === "All" || recipe.category === selectedCategory;
      if (!matchesCategory) return false;

      if (queryTerms.length === 0) return true;

      const title = recipe.title.toLowerCase();
      const category = recipe.category.toLowerCase();

      // Check if all search terms appear in the title or category
      return queryTerms.every(
        (term) => title.includes(term) || category.includes(term)
      );
    });
  }, [debouncedSearchQuery, selectedCategory]);

  // Featured recipes (first 5 from different categories)
  const featuredRecipes = useMemo(() => {
    const seen = new Set<string>();
    return recipes.filter((r) => {
      if (seen.has(r.category)) return false;
      seen.add(r.category);
      return true;
    }).slice(0, 5);
  }, []);

  const quickRecipes = useMemo(() => {
    return recipes.filter((r) => r.metadata.totalTimeMinutes <= 30).slice(0, 10);
  }, []);

  const isSearching = debouncedSearchQuery.trim().length > 0;

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(600)}
        style={styles.header}
      >
        <View style={styles.headerTitleRow}>
          <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
              <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
              <Text style={styles.logoText}>yuml</Text>
              <SpatulaIcon size={20} color={COLORS.primary} />
            </View>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.greetingSection}
        >
          <View style={styles.greetingRow}>
            <Text style={styles.greetingEmoji}>{greeting.emoji}</Text>
            <Text style={styles.greeting}>
              {greeting.text}, {name || "Chef"}
            </Text>
          </View>
          <Text style={styles.subGreeting}>
            What would you{"\n"}like to cook?
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Search Bar */}
      <SearchBar 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
        onSubmitEditing={() => addToRecentSearches(searchQuery)}
      />

      {/* Featured Carousel - only show when not searching */}
      {!isSearching && !isSearchFocused && selectedCategory === "All" && (
        <FeaturedCarousel recipes={featuredRecipes} />
      )}

      {/* Quick Recipes Section */}
      {!isSearching && !isSearchFocused && selectedCategory === "All" && (
        <View style={styles.quickSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>QUICK BITES</Text>
            <Text style={styles.sectionValue}>UNDER 30 MINS</Text>
          </View>
          <FlatList
            data={quickRecipes}
            keyExtractor={(item) => `quick-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickList}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 100)}>
                <RecipeCard 
                  recipe={item} 
                  index={index} 
                  horizontal 
                  containerStyle={styles.quickCard} 
                />
              </Animated.View>
            )}
          />
        </View>
      )}

      {/* Categories Bar */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>BROWSE</Text>
          <Text style={styles.recipeCount}>
            {filteredRecipes.length} recipes
          </Text>
        </View>
        <CategoryBar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat !== "All") setSearchQuery("");
          }}
        />
      </View>

      {/* Recent Searches */}
      {isSearchFocused && searchQuery.length === 0 && recentSearches.length > 0 && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          style={styles.recentSearches}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>RECENT SEARCHES</Text>
            <Pressable onPress={() => {
              setRecentSearches([]);
              AsyncStorage.removeItem("recent_searches");
            }}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
          </View>
          <View style={styles.recentChips}>
            {recentSearches.map((query) => (
              <View key={query} style={styles.recentChip}>
                <Pressable 
                  style={styles.recentChipContent}
                  onPress={() => setSearchQuery(query)}
                >
                  <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.recentText}>{query}</Text>
                </Pressable>
                <Pressable 
                  onPress={() => removeRecentSearch(query)}
                  style={styles.removeRecent}
                >
                  <Ionicons name="close" size={14} color={COLORS.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="search-outline"
      title="No Recipes Found"
      description={`We couldn't find any recipes matching "${searchQuery}" in ${selectedCategory === "All" ? "any category" : selectedCategory}.`}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RecipeCard recipe={item} index={index} />
        )}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        windowSize={11}
        removeClippedSubviews={true}
        ListFooterComponent={<View style={styles.footerSpacer} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingTop: SPACING.s,
  },
  headerContent: {
    marginBottom: SPACING.s,
  },
  columnWrapper: {
    paddingHorizontal: SPACING.m,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: SPACING.m,
  },
  headerTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  logoContainer: {
    alignItems: "flex-start",
    justifyContent: "center",
    height: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoText: {
    fontSize: 22,
    fontFamily: FONTS.serif,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 1,
  },
  rankBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  rankText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.primary,
    fontFamily: FONTS.mono,
    letterSpacing: 0.5,
  },
  quickSection: {
    marginTop: SPACING.l,
    marginBottom: SPACING.m,
  },
  quickList: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    gap: SPACING.m,
  },
  quickCard: {
    width: 220,
    marginRight: 0,
  },
  sectionValue: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
    fontFamily: FONTS.mono,
  },
  greetingSection: {
    marginTop: SPACING.xs,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  greetingEmoji: {
    fontSize: 16,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  subGreeting: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 36,
    fontFamily: FONTS.serif,
    letterSpacing: -0.5,
  },
  categoriesSection: {
    marginTop: SPACING.s,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontFamily: FONTS.mono,
  },
  recipeCount: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textMuted,
    fontFamily: FONTS.mono,
  },
  recentSearches: {
    marginTop: SPACING.m,
    paddingHorizontal: SPACING.m,
  },
  recentChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.s,
    marginTop: SPACING.s,
  },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.elevated,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: 10,
    paddingRight: 4,
    height: 34,
  },
  recentChipContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingRight: 6,
  },
  recentText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  removeRecent: {
    padding: 4,
  },
  clearAllText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.error,
    fontFamily: FONTS.mono,
  },
  footerSpacer: {
    height: 100,
  },
});
