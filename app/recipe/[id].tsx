import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
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
import IngredientList from "../../src/components/recipe/IngredientList";
import InstructionStep from "../../src/components/recipe/InstructionStep";
import { RecipeImages } from "../../src/constants/recipe-images";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../src/constants/theme";
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
        <Text>Recipe not found</Text>
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
        params: { id: recipe.id },
      });
    } else {
      router.push("/(tabs)/mealplan");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.heroContainer}>
          <Image
            source={RecipeImages[recipe.id]}
            style={styles.heroImage}
            contentFit="cover"
          />
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </Pressable>
          <Pressable
            style={styles.headerFavoriteButton}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isRecipeFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isRecipeFavorite ? "#FF3B30" : COLORS.text}
            />
          </Pressable>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.summary}>{recipe.summary}</Text>

          {/* Start Cooking Button - Triggers Modal */}
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setModalVisible(true);
            }}
          >
            <Text style={styles.primaryButtonText}>Start Cooking</Text>
          </Pressable>

          {/* Quick Info Bar */}
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Ionicons name="flame-outline" size={20} color={COLORS.primary} />
              <View>
                <Text style={styles.infoLabel}>Calories</Text>
                <Text style={styles.infoValue}>
                  {recipe.metadata.calories} kcal
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="people-outline"
                size={20}
                color={COLORS.primary}
              />
              <View>
                <Text style={styles.infoLabel}>Servings</Text>
                <Text style={styles.infoValue}>{recipe.metadata.servings}</Text>
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
                <Text style={styles.sectionTitle}>Instructions</Text>
                <View style={styles.stepCountBadge}>
                  <Text style={styles.stepCountText}>
                    {recipe.instructions.length} steps
                  </Text>
                </View>
              </View>
              <Ionicons
                name={instructionsExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={COLORS.textLight}
              />
            </Pressable>
            {instructionsExpanded && recipe.instructions.map((step) => (
              <InstructionStep
                key={step.step}
                step={step.step}
                text={step.text}
                timerSeconds={step.timerSeconds}
                readOnly={true}
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Proportion</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              How many people are you cooking for today?
            </Text>

            <View style={styles.servingsPicker}>
              <Pressable
                onPress={() => setServings(Math.max(1, servings - 1))}
                style={styles.pickerBtn}
              >
                <Ionicons name="remove" size={28} color={COLORS.primary} />
              </Pressable>

              <View style={styles.servingsCountContainer}>
                <Text style={styles.servingsNumber}>{servings}</Text>
                <Text style={styles.servingsLabel}>Members</Text>
              </View>

              <Pressable
                onPress={() => setServings(servings + 1)}
                style={styles.pickerBtn}
              >
                <Ionicons name="add" size={28} color={COLORS.primary} />
              </Pressable>
            </View>

            <View style={styles.proportionBox}>
              <Text style={styles.proportionText}>
                The ingredients will be automatically adjusted for {servings}{" "}
                people (x{(servings / recipe.metadata.servings).toFixed(1)}{" "}
                proportion).
              </Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalBtn, styles.planBtn]}
                onPress={() => handleAddToPlan(false)}
              >
                <Text style={styles.planBtnText}>Add to Plan</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.cookBtn]}
                onPress={() => handleAddToPlan(true)}
              >
                <Ionicons name="play" size={18} color="white" />
                <Text style={styles.cookBtnText}>Cook Now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  heroContainer: {
    height: 350,
    width: width,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
  },
  headerFavoriteButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
  },
  contentCard: {
    flex: 1,
    marginTop: -30,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.l,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.text,
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.s,
  },
  summary: {
    fontSize: 14,
    color: COLORS.textLight,
    paddingHorizontal: SPACING.m,
    lineHeight: 22,
    marginBottom: SPACING.l,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
    alignItems: "center",
    marginBottom: SPACING.l,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    marginHorizontal: SPACING.m,
    padding: SPACING.m,
    borderRadius: RADIUS.l,
    ...SHADOWS.small,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
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
  stepCountBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  stepCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backLink: {
    marginTop: 20,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.l,
    paddingBottom: 50,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: SPACING.xl,
  },
  servingsPicker: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SPACING.l,
  },
  pickerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.small,
  },
  servingsCountContainer: {
    alignItems: "center",
    marginHorizontal: SPACING.xl,
  },
  servingsNumber: {
    fontSize: 42,
    fontWeight: "bold",
    color: COLORS.text,
  },
  servingsLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: -5,
  },
  proportionBox: {
    backgroundColor: "#FFF9F0",
    padding: SPACING.m,
    borderRadius: RADIUS.m,
    marginVertical: SPACING.l,
    borderWidth: 1,
    borderColor: "rgba(156, 90, 60, 0.1)",
  },
  proportionText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: SPACING.m,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.m,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    ...SHADOWS.small,
  },
  planBtn: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  planBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  cookBtn: {
    backgroundColor: COLORS.primary,
  },
  cookBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
