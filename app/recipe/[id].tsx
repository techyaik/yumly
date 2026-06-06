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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import IngredientList from "../../src/components/recipe/IngredientList";
import { ReadOnlyInstructionStep } from "../../src/components/recipe/InstructionStep";
import { RecipeImages } from "../../src/constants/recipe-images";
import { COLORS, FONTS, RADIUS, SHADOWS, SPACING } from "../../src/constants/theme";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useMealPlan } from "../../src/context/MealPlanContext";
import recipesData from "../../src/data/recipes.json";
import { Recipe } from "../../src/types";

const recipes = recipesData as Recipe[];

const { width } = Dimensions.get("window");

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToMealPlan } = useMealPlan();
  const { isFavorite, toggleFavorite } = useFavorites();

  const recipeId = Array.isArray(id) ? id[0] ?? "" : id ?? "";
  const recipe = recipes.find((r) => r.id === recipeId);

  const [modalVisible, setModalVisible] = useState(false);
  const [servings, setServings] = useState(recipe?.metadata.servings || 4);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Recipe not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={RecipeImages[recipe.id]}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(13,13,15,0.3)", "transparent", "rgba(13,13,15,0.95)"]}
            locations={[0, 0.3, 1]}
            style={styles.heroGradient}
          />

          {/* Top buttons */}
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </Pressable>
          <Pressable
            style={[
              styles.headerFavoriteButton,
              isRecipeFavorite && styles.headerFavActive,
            ]}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isRecipeFavorite ? "heart" : "heart-outline"}
              size={22}
              color={isRecipeFavorite ? COLORS.error : COLORS.text}
            />
          </Pressable>

          {/* Title overlay on hero */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.heroContent}
          >
            <View style={styles.heroTags}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{recipe.category}</Text>
              </View>
              <View
                style={[
                  styles.vegTag,
                  { backgroundColor: recipe.isVeg ? `${COLORS.veg}20` : `${COLORS.nonVeg}20` },
                ]}
              >
                <View
                  style={[
                    styles.vegTagDot,
                    { backgroundColor: recipe.isVeg ? COLORS.veg : COLORS.nonVeg },
                  ]}
                />
                <Text
                  style={[
                    styles.vegTagText,
                    { color: recipe.isVeg ? COLORS.veg : COLORS.nonVeg },
                  ]}
                >
                  {recipe.isVeg ? "Veg" : "Non-Veg"}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{recipe.title}</Text>
          </Animated.View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={styles.summary}>{recipe.summary}</Text>
          </Animated.View>

          {/* Start Cooking Button */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setModalVisible(true);
              }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnGradient}
              >
                <Ionicons name="play" size={18} color="#1A0E04" />
                <Text style={styles.primaryButtonText}>Start Cooking</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Quick Info Bar */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.infoBar}
          >
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} />
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
                <Ionicons name="flame-outline" size={18} color={COLORS.accentWarm} />
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
                <Ionicons name="people-outline" size={18} color={COLORS.secondary} />
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
                  color={COLORS.accentCool}
                />
              </View>
              <View>
                <Text style={styles.infoValue}>
                  {recipe.metadata.difficulty}
                </Text>
                <Text style={styles.infoLabel}>Level</Text>
              </View>
            </View>
          </Animated.View>

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
                <Text style={styles.sectionTitle}>Instructions</Text>
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
                  color={COLORS.textMuted}
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
          <Animated.View
            entering={FadeInUp.duration(400)}
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
                <Ionicons name="close" size={20} color={COLORS.textMuted} />
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
                <Ionicons name="remove" size={24} color={COLORS.primary} />
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
                <Ionicons name="add" size={24} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.proportionBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
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
                <Ionicons name="calendar-outline" size={18} color={COLORS.text} />
                <Text style={styles.planBtnText}>Add to Plan</Text>
              </Pressable>

              <Pressable
                style={styles.cookBtn}
                onPress={() => handleAddToPlan(true)}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.cookBtnGradient}
                >
                  <Ionicons name="play" size={16} color="#1A0E04" />
                  <Text style={styles.cookBtnText}>Cook Now</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    top: 54,
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
    top: 54,
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
    color: COLORS.text,
    fontFamily: FONTS.serif,
    letterSpacing: -0.5,
  },
  contentCard: {
    flex: 1,
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    paddingTop: SPACING.l,
    paddingBottom: 100,
  },
  summary: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.m,
    padding: SPACING.m,
    borderRadius: RADIUS.l,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    backgroundColor: COLORS.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
    fontFamily: FONTS.mono,
  },
  infoDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
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
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  stepCountBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.s + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
  },
  stepCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    fontFamily: FONTS.mono,
  },
  expandBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },
  backLink: {
    marginTop: 20,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.l,
    paddingBottom: 50,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.border,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.bg3,
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
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    fontFamily: FONTS.serif,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.elevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.elevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  servingsCountContainer: {
    alignItems: "center",
    marginHorizontal: SPACING.xl,
  },
  servingsNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.text,
    fontFamily: FONTS.mono,
  },
  servingsLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: -4,
    fontWeight: "500",
  },
  proportionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginVertical: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.borderAccent,
    gap: SPACING.s,
  },
  proportionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
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
    backgroundColor: COLORS.elevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  planBtnText: {
    color: COLORS.text,
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
