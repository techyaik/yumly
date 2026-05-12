import React, { useState } from "react";
import { 
  FlatList,
  Image,
  StyleSheet, 
  Text, 
  View, 
  StatusBar,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../src/constants/theme";
import SearchBar from "../../src/components/recipe/SearchBar";
import RecipeCard from "../../src/components/recipe/RecipeCard";
import CategoryBar from "../../src/components/recipe/CategoryBar";
import { Recipe } from "../../src/types";
import recipesData from "../../src/data/recipes.json";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../src/context/UserContext";
import EmptyState from "../../src/components/common/EmptyState";
import { useDebounce } from "../../src/hooks/useDebounce";

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

export default function HomeScreen() {
  const { name } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredRecipes = React.useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    const queryTerms = query.split(/\s+/).filter(term => term.length > 0);

    return recipes.filter((recipe) => {
      const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;
      if (!matchesCategory) return false;

      if (queryTerms.length === 0) return true;

      const title = recipe.title.toLowerCase();
      const category = recipe.category.toLowerCase();
      
      // Check if all search terms appear in the title or category
      return queryTerms.every(term => title.includes(term) || category.includes(term));
    });
  }, [debouncedSearchQuery, selectedCategory]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../assets/images/LOGO1.png")} 
              style={styles.logoImage} 
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.profileBtn}>
             <Text style={styles.profileEmoji}>👨‍🍳</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Hello, {name || "Chef"}!</Text>
          <Text style={styles.subGreeting}>Discover Your Next{"\n"}Favorite Recipe</Text>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Categories Bar */}
      <CategoryBar 
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
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
    paddingTop: SPACING.m,
  },
  headerContent: {
    marginBottom: SPACING.m,
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
  logoImage: {
    width: 120,
    height: 40,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingSection: {
    marginTop: SPACING.s,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
    lineHeight: 38,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileEmoji: {
    fontSize: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.m,
  },
  footerSpacer: {
    height: 80, // Space for tab bar
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: SPACING.xl * 2,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  emptyText: {
    marginTop: SPACING.m,
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: "600",
  }
});
