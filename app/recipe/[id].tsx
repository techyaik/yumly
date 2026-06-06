import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import IngredientList from "../../src/components/recipe/IngredientList";
import { ReadOnlyInstructionStep } from "../../src/components/recipe/InstructionStep";
import { RecipeImages } from "../../src/constants/recipe-images";
import { FONTS, RADIUS, SHADOWS, SPACING } from "../../src/constants/theme";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useMealPlan } from "../../src/context/MealPlanContext";
import { useTheme } from "../../src/context/ThemeContext";
import recipesData from "../../src/data/recipes.json";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

const { width } = Dimensions.get("window");

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { addToMealPlan } = useMealPlan();
  const { isFavorite, toggleFavorite } = useFavorites();

  const recipeId = Array.isArray(id) ? id[0] ?? "" : id ?? "";
  const recipe = recipes.find((r) => r.id === recipeId);

  const [modalVisible, setModalVisible] = useState(false);
  const [servings, setServings] = useState(recipe?.metadata.servings || 4);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  if (!recipe) {
    return (
      <SafeAreaView style={[styles.errorContainer, { backgroundColor: colors.background }]} edges={["left", "right"]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Recipe not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isRecipeFavorite = isFavorite(recipeId);

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(recipeId);
  };

  const handleAddToPlan = (shouldStartCooking: boolean = false) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToMealPlan(recipe.id, recipe.title, servings);
    setModalVisible(false);

    if (shouldStartCooking) {
      router.push({
        pathname: "/cooking/[id]",
        params: { id: recipe.id, servings: servings },
      });
    } else {
      router.push("/(tabs)/mealplan");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["left", "right"]}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={RecipeImages[recipe.id]}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(13,13,15,0.15)", "rgba(13,13,15,0.85)"]}
            style={styles.heroGradient}
          />

          {/* Top buttons */}
          <Pressable style={[styles.backButton, { top: insets.top + SPACING.s }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#F5F0EB" />
          </Pressable>
          <Pressable
            style={[
              styles.headerFavoriteButton,
              { top: insets.top + SPACING.s },
              isRecipeFavorite && styles.headerFavActive,
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isRecipeFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isRecipeFavorite ? colors.error : "#F5F0EB"}
            />
          </Pressable>

          {/* Title overlay on hero */}
          <View style={styles.heroContent}>
            <View style={styles.heroTags}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{recipe.category}</Text>
              </View>
              <View
                style={[
                  styles.vegTag,
                  { backgroundColor: recipe.isVeg ? `${colors.veg}20` : `${colors.nonVeg}20` },
                ]}
              >
                <View
                  style={[
                    styles.vegTagDot,
                    { backgroundColor: recipe.isVeg ? colors.veg : colors.nonVeg },
                  ]}
                />
                <Text
                  style={[
                    styles.vegTagText,
                    { color: recipe.isVeg ? colors.veg : colors.nonVeg },
                  ]}
                >
                  {recipe.isVeg ? "Veg" : "Non-Veg"}
                </Text>
              </View>
            </View>
            <Text style={[styles.heroTitle, { color: "#F5F0EB" }]}>{recipe.title}</Text>
          </View>
        </View>

        {/* Content Card */}
        <View style={[styles.contentCard, { backgroundColor: colors.background, paddingBottom: insets.bottom + 100 }]}>
          <View>
            <Text style={[styles.summary, { color: colors.textSecondary }]}>{recipe.summary}</Text>
          </View>

          {/* Start Cooking Button */}
          <View>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setModalVisible(true);
              }}
            >
              <View style={[styles.primaryBtnGradient, { backgroundColor: colors.primary }]}>
                <Ionicons name="play" size={18} color={colors.inverseText} />
                <Text style={[styles.primaryButtonText, { color: colors.inverseText }]}>Start Cooking</Text>
              </View>
            </Pressable>
          </View>

          {/* Quick Info Bar */}
          <View
            style={[styles.infoBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {recipe.metadata.prepTimeMinutes}m
                </Text>
                <Text style={styles.infoLabel}>Prep</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="flame-outline" size={18} color={colors.accentWarm} />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {recipe.metadata.calories}
                </Text>
                <Text style={styles.infoLabel}>Calories</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="people-outline" size={18} color={colors.secondary} />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {recipe.metadata.servings}
                </Text>
                <Text style={styles.infoLabel}>Servings</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrap}>
                <Ionicons
                  name="stats-chart-outline"
                  size={18}
                  color={colors.accentCool}
                />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {recipe.metadata.difficulty}
                </Text>
                <Text style={styles.infoLabel}>Level</Text>
              </View>
            </View>
          </View>

          {/* Ingredients Section */}
          <IngredientList
            ingredients={recipe.ingredients}
            initialServings={recipe.metadata.servings}
          />

          {/* Instructions Section */}
          <View style={styles.instructionsContainer}>
            <Pressable
              style={styles.instructionsHeader}
              onPress={() => setInstructionsExpanded(!instructionsExpanded)}
            >
              <View style={styles.instructionsHeaderLeft}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructions</Text>
                <View style={styles.stepCountBadge}>
                  <Text style={styles.stepCountText}>
                    {recipe.instructions.length} steps
                  </Text>
                </View>
              </View>
              <View style={styles.expandBtn}>
                <Ionicons
                  name={instructionsExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
            {instructionsExpanded &&
              recipe.instructions.map((step) => (
                <ReadOnlyInstructionStep
                  key={step.step}
                  step={step.step}
                  text={step.text}
                />
              ))}
          </View>
        </View>
      </ScrollView>

      {/* Serving Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={styles.modalContent}
          >
            {/* Handle bar */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalLabel}>PORTION SIZE</Text>
                <Text style={styles.modalTitle}>Choose Proportion</Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              How many people are you cooking for?
            </Text>

            <View style={styles.servingsPicker}>
              <Pressable
                onPress={() => setServings(Math.max(1, servings - 1))}
                style={styles.pickerBtn}
              >
                <Ionicons name="remove" size={24} color={colors.primary} />
              </Pressable>

              <View style={styles.servingsCountContainer}>
                <Text style={styles.servingsNumber}>{servings}</Text>
                <Text style={styles.servingsLabel}>
                  {servings === 1 ? "Person" : "People"}
                </Text>
              </View>

              <Pressable
                onPress={() => setServings(servings + 1)}
                style={styles.pickerBtn}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </Pressable>
            </View>

            <View style={styles.proportionBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.proportionText}>
                Ingredients adjusted for {servings} people (×
                {(servings / recipe.metadata.servings).toFixed(1)})
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.planBtn}
                onPress={() => handleAddToPlan(false)}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.text} />
                <Text style={styles.planBtnText}>Add to Plan</Text>
              </Pressable>

              <Pressable
                style={styles.cookBtn}
                onPress={() => handleAddToPlan(true)}
              >
                <View style={[styles.cookBtnGradient, { backgroundColor: colors.primary }]}>
                  <Ionicons name="play" size={16} color={colors.inverseText} />
                  <Text style={[styles.cookBtnText, { color: colors.inverseText }]}>Cook Now</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  heroContainer: {
    height: 380,
    width: width,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerFavoriteButton: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  headerFavActive: {
    backgroundColor: "rgba(232, 93, 93, 0.2)",
    borderColor: "rgba(232, 93, 93, 0.3)",
  },
  heroContent: {
    position: "absolute",
    bottom: SPACING.l,
    left: SPACING.m,
    right: SPACING.m,
  },
  heroTags: {
    flexDirection: "row",
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  categoryTag: {
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
  vegTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.s + 2,
    paddingVertical: 4,
    borderRadius: RADIUS.s,
    gap: 4,
  },
  vegTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vegTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",

    fontFamily: FONTS.serif,
    letterSpacing: -0.5,
  },
  contentCard: {
    flex: 1,
    marginTop: -20,

    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.l,
    paddingBottom: 100,
  },
  summary: {
    fontSize: 14,

    paddingHorizontal: SPACING.m,
    lineHeight: 22,
    marginBottom: SPACING.l,
  },
  primaryButton: {
    marginHorizontal: SPACING.m,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    marginBottom: SPACING.l,
    ...SHADOWS.glow,
  },
  primaryBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    gap: SPACING.s,
  },
  primaryButtonText: {
    color: "#1A0E04",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  // Info bar
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginHorizontal: SPACING.m,
    padding: SPACING.m,
    borderRadius: RADIUS.l,
    borderWidth: 1,

  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 9,

    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "800",

    fontFamily: FONTS.mono,
  },
  infoDivider: {
    width: 1,
    height: 30,

  },
  // Instructions
  instructionsContainer: {
    marginTop: SPACING.m,
    paddingHorizontal: SPACING.m,
  },
  instructionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.s,
  },
  instructionsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",

    fontFamily: FONTS.serif,
  },
  stepCountBadge: {

    paddingHorizontal: SPACING.s + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,

  },
  stepCountText: {
    fontSize: 11,
    fontWeight: "700",

    fontFamily: FONTS.mono,
  },
  expandBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

  },
  errorText: {

    fontSize: 18,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 20,

    fontWeight: "bold",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {

    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.l,
    paddingBottom: 50,
    borderWidth: 1,
    borderBottomWidth: 0,

  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,

    alignSelf: "center",
    marginBottom: SPACING.l,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.m,
  },
  modalLabel: {
    fontSize: 10,
    fontWeight: "800",

    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",

    fontFamily: FONTS.serif,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,

  },
  modalSubtitle: {
    fontSize: 14,

    marginBottom: SPACING.l,
  },
  servingsPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SPACING.l,
  },
  pickerBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,

    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,

  },
  servingsCountContainer: {
    alignItems: "center",
    marginHorizontal: SPACING.xl,
  },
  servingsNumber: {
    fontSize: 48,
    fontWeight: "800",

    fontFamily: FONTS.mono,
  },
  servingsLabel: {
    fontSize: 13,

    marginTop: -4,
    fontWeight: "500",
  },
  proportionBox: {
    flexDirection: "row",
    alignItems: "center",

    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginVertical: SPACING.m,
    borderWidth: 1,

    gap: SPACING.s,
  },
  proportionText: {
    flex: 1,
    fontSize: 13,

    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: SPACING.m,
  },
  planBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.l,

    borderWidth: 1,

    gap: 8,
  },
  planBtnText: {

    fontSize: 14,
    fontWeight: "700",
  },
  cookBtn: {
    flex: 1,
    borderRadius: RADIUS.l,
    overflow: "hidden",
    ...SHADOWS.glow,
  },
  cookBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    gap: 8,
  },
  cookBtnText: {
    color: "#1A0E04",
    fontSize: 14,
    fontWeight: "800",
  },
});
