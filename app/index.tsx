import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, RADIUS, SHADOWS, SPACING } from "../src/constants/theme";
import { useTheme } from "../src/context/ThemeContext";
import { useUser } from "../src/context/UserContext";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const {
    onboardingComplete,
    setName: setGlobalName,
    setOnboardingComplete,
    isLoading: isUserLoading,
  } = useUser();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const screenOpacity = useSharedValue(1);
  const screenTranslateX = useSharedValue(0);

  useEffect(() => {
    if (!isUserLoading && onboardingComplete) {
      router.replace("/(tabs)");
    }
  }, [onboardingComplete, isUserLoading, router]);

  const animateToStep = useCallback(
    (nextStep: number, direction: "forward" | "back" = "forward") => {
      const offset = direction === "forward" ? 40 : -40;
      screenOpacity.value = withTiming(0, { duration: 250 }, () => {
        screenTranslateX.value = offset;
        runOnJS(setStep)(nextStep);
        screenTranslateX.value = withTiming(0, { duration: 350 });
        screenOpacity.value = withTiming(1, { duration: 350 });
      });
    },
    [screenOpacity, screenTranslateX]
  );

  const handleBackStep = useCallback(() => {
    if (step > 1) {
      animateToStep(step - 1, "back");
    }
  }, [step, animateToStep]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (step > 1) {
        handleBackStep();
        return true;
      }
      return false;
    });
    return () => backHandler.remove();
  }, [step, handleBackStep]);

  const handleNextStep = () => {
    if (step === 1) animateToStep(2);
    else if (step === 2 && name.length >= 2) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setGlobalName(name);
        animateToStep(3);
      }, 1200);
    }
  };

  const handleExplore = () => {
    setOnboardingComplete(true);
    router.replace("/(tabs)");
  };

  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateX: screenTranslateX.value }],
  }));

  if (isUserLoading)
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom", "left", "right"]}
      />
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom", "left", "right"]}>
      <StatusBar barStyle={mode === "dark" ? "light-content" : "dark-content"} />

      {/* Header row: back button + progress dots — stays fixed above keyboard */}
      <View style={styles.topBar}>
        <View style={styles.backBtnSlot}>
          {step > 1 && (
            <Pressable
              onPress={handleBackStep}
              style={[styles.backBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </Pressable>
          )}
        </View>
        <View style={styles.dotsRow}>
          <View style={[styles.progressDot, { backgroundColor: step >= 1 ? colors.primary : colors.bg3 }]} />
          <View style={[styles.progressDot, { backgroundColor: step >= 2 ? colors.primary : colors.bg3 }]} />
          <View style={[styles.progressDot, { backgroundColor: step >= 3 ? colors.primary : colors.bg3 }]} />
        </View>
        <View style={styles.backBtnSlot} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "position" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Animated.View style={[styles.screenWrapper, animatedScreenStyle]}>
          {step === 1 && <StepOne onNext={handleNextStep} colors={colors} />}
          {step === 2 && (
            <StepTwo
              name={name}
              setName={setName}
              onNext={handleNextStep}
              isLoading={isLoading}
              colors={colors}
            />
          )}
          {step === 3 && (
            <StepThree name={name} onExplore={handleExplore} colors={colors} />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const StepOne = ({ onNext, colors }: { onNext: () => void; colors: any }) => {
  return (
    <View style={styles.stepContent}>
      <View style={styles.heroArea}>
        <View style={styles.plateWrap}>
          <View style={[styles.plateRing2, { borderColor: `${colors.primary}08` }]} />
          <View style={[styles.plateRing, { borderColor: `${colors.primary}15` }]}>
            <View style={[styles.ringDot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={[styles.plateCircle, { backgroundColor: colors.surface, borderColor: `${colors.primary}15` }]}>
            <Ionicons name="restaurant-outline" size={44} color={colors.primary} />
            <View style={[styles.orbitBadge, { backgroundColor: colors.elevated, borderColor: `${colors.primary}25` }, styles.badge1]}>
              <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>200+ recipes</Text>
            </View>
            <View style={[styles.orbitBadge, { backgroundColor: colors.elevated, borderColor: `${colors.primary}25` }, styles.badge2]}>
              <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>Step-by-step</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomContent}>
        <Text style={[styles.headline, { color: colors.text }]}>
          Cook with{" "}
          <Text style={{ color: colors.primary }}>passion,</Text>
          {"\n"}eat with joy.
        </Text>
        <Text style={[styles.subheadline, { color: colors.textSecondary }]}>
          Discover hundreds of recipes with guided cooking, timers, and smart meal planning.
        </Text>

        <TouchableOpacity
          style={styles.mainBtn}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <View style={[styles.solidBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.mainBtnText, { color: colors.inverseText }]}>Get Started</Text>
          </View>
        </TouchableOpacity>

        {/* <View style={styles.signinRow}>
          <Text style={[styles.signinText, { color: colors.textMuted }]}>Already have an account? </Text>
          <Pressable>
            <Text style={[styles.signinLink, { color: colors.primary }]}>Sign in</Text>
          </Pressable>
        </View> */}
      </View>
    </View>
  );
};

const StepTwo = ({
  name,
  setName,
  onNext,
  isLoading,
  colors,
}: {
  name: string;
  setName: (name: string) => void;
  onNext: () => void;
  isLoading: boolean;
  colors: any;
}) => {
  return (
    <ScrollView
      style={styles.stepContent}
      contentContainerStyle={styles.stepScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={[styles.s2Top, { backgroundColor: colors.surface }]}>
        <View style={styles.welcomeIconWrap}>
          <View style={[styles.welcomeBowl, { backgroundColor: colors.card, borderColor: `${colors.primary}15` }]}>
            <Ionicons name="person-outline" size={30} color={colors.primary} />
          </View>
        </View>
      </View>

      <View style={[styles.s2Content, { backgroundColor: colors.background }]}>
        <Text style={[styles.s2Label, { color: colors.primary }]}>QUICK SETUP</Text>
        <Text style={[styles.s2Title, { color: colors.text }]}>
          What should{"\n"}we call you?
        </Text>
        <Text style={[styles.s2Sub, { color: colors.textSecondary }]}>
          We{"'"}ll personalize your entire food journey around your preferences.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textMuted }]}>YOUR FIRST NAME</Text>
          <TextInput
            style={[styles.nameInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Alex, Priya, Marco..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            selectionColor={colors.primary}
            returnKeyType="next"
            onSubmitEditing={() => name.length >= 2 && onNext()}
          />
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, (name.length < 2 || isLoading) && styles.btnDisabled]}
          onPress={onNext}
          disabled={name.length < 2 || isLoading}
          activeOpacity={0.85}
        >
          <View style={[styles.solidBtn, { backgroundColor: colors.primary }]}>
            {isLoading ? (
              <View style={styles.loadingDots}>
                <View style={[styles.loadingDot, { backgroundColor: colors.inverseText }]} />
                <View style={[styles.loadingDot, { backgroundColor: colors.inverseText }]} />
                <View style={[styles.loadingDot, { backgroundColor: colors.inverseText }]} />
              </View>
            ) : (
              <Text style={[styles.mainBtnText, { color: colors.inverseText }]}>Let{"'"}s Cook</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const StepThree = ({
  name,
  onExplore,
  colors,
}: {
  name: string;
  onExplore: () => void;
  colors: any;
}) => {
  const capName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <ScrollView
      style={styles.stepContent}
      contentContainerStyle={styles.stepScrollContent}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.welcomeAnim}>
        <View style={[styles.wPlate, { backgroundColor: colors.surface, borderColor: `${colors.primary}15` }]}>
          <Ionicons name="checkmark-circle" size={38} color={colors.primary} />
        </View>
        <View style={[styles.checkmark, { backgroundColor: colors.primary, borderColor: colors.background }]}>
          <Ionicons name="checkmark" size={14} color={colors.inverseText} />
        </View>
      </View>

      <Text style={[styles.welcomeName, { color: colors.text }]}>
        Welcome,{"\n"}
        <Text style={{ color: colors.primary }}>{capName || "Chef"}!</Text>
      </Text>
      <Text style={[styles.welcomeTagline, { color: colors.textSecondary }]}>
        Your culinary journey begins now. Discover, cook, and savour every moment.
      </Text>

      <View style={styles.featureGrid}>
        <FeatureCard icon="search-outline" title="Explore Recipes" desc="200+ curated dishes" colors={colors} />
        <FeatureCard icon="restaurant-outline" title="Guided Cooking" desc="Step-by-step mode" colors={colors} />
        <FeatureCard icon="calendar-outline" title="Meal Planner" desc="Plan your meals" colors={colors} />
        <FeatureCard icon="timer-outline" title="Smart Timers" desc="Built-in timers" colors={colors} />
      </View>

      <TouchableOpacity
        style={styles.exploreBtn}
        onPress={onExplore}
        activeOpacity={0.85}
      >
        <View style={[styles.solidBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.mainBtnText, { color: colors.inverseText }]}>Explore Yumly</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const FeatureCard = ({
  icon,
  title,
  desc,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  desc: string;
  colors: any;
}) => (
  <View style={[styles.featCard, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.small]}>
    <View style={[styles.featIconWrap, { backgroundColor: colors.primaryLight }]}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <Text style={[styles.featTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.featDesc, { color: colors.textMuted }]}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenWrapper: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
  },
  stepScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnSlot: {
    width: 40,
    height: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.xs,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 300,
  },
  plateWrap: {
    width: 170,
    height: 170,
    justifyContent: "center",
    alignItems: "center",
  },
  plateRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  plateRing2: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  ringDot: {
    position: "absolute",
    top: -5,
    left: "50%",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  plateCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitBadge: {
    position: "absolute",
    borderWidth: 1,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge1: { top: -12, right: -20 },
  badge2: { bottom: 18, left: -30 },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bottomContent: {
    width: "100%",
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.l,
  },
  headline: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
    marginBottom: 10,
    fontFamily: FONTS.serif,
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 28,
  },
  mainBtn: {
    width: "100%",
    borderRadius: RADIUS.l,
    overflow: "hidden",
  },
  solidBtn: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mainBtnText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signinText: { fontSize: 13 },
  signinLink: { fontSize: 13, fontWeight: "700" },
  s2Top: {
    width: "100%",
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeIconWrap: {
    marginTop: 10,
  },
  welcomeBowl: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  s2Content: {
    flex: 1,
    width: "100%",
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    marginTop: -30,
    padding: SPACING.m,
  },
  s2Label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2.5,
    marginBottom: 8,
    fontFamily: FONTS.mono,
  },
  s2Title: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: 8,
    fontFamily: FONTS.serif,
  },
  s2Sub: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 28,
  },
  inputGroup: { marginBottom: 18 },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1.5,
    fontFamily: FONTS.mono,
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: RADIUS.l,
    padding: 16,
    fontSize: 16,
  },
  continueBtn: {
    width: "100%",
    borderRadius: RADIUS.l,
    overflow: "hidden",
  },
  btnDisabled: { opacity: 0.4 },
  loadingDots: { flexDirection: "row", gap: 6 },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  welcomeAnim: { marginBottom: 24, position: "relative" },
  wPlate: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  checkmark: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: FONTS.serif,
    marginBottom: 10,
  },
  welcomeTagline: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: SPACING.l,
  },
  featureGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: SPACING.m,
    marginBottom: 28,
  },
  featCard: {
    width: (width - SPACING.m * 2 - 10) / 2,
    borderWidth: 1,
    borderRadius: RADIUS.l,
    padding: 14,
  },
  featIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featIcon: { marginBottom: 0 },
  featTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  featDesc: { fontSize: 11 },
  exploreBtn: {
    width: width - SPACING.m * 2,
    borderRadius: RADIUS.l,
    overflow: "hidden",
  },
});
