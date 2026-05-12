import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING } from "../src/constants/theme";
import { useUser } from "../src/context/UserContext";

const { width, height } = Dimensions.get("window");

// --- Constants ---
// Use global COLORS instead of local THEME
const THEME = COLORS;

// --- Sub-components ---

const FloatingOrb = ({ style, delay = 0 }: { style: object; delay?: number }) => {
  const floatX = useSharedValue(0);
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    floatX.value = withDelay(delay, withRepeat(withTiming(20, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true));
    floatY.value = withDelay(delay, withRepeat(withTiming(-30, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true));
    scale.value = withDelay(delay, withRepeat(withTiming(1.1, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: floatX.value },
      { translateY: floatY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.orb, style, animatedStyle]}>
      <LinearGradient
        colors={[style.backgroundColor, "transparent"]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

const Particle = ({ delay = 0 }: { delay?: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const top = Math.random() * 100;
  const left = Math.random() * 100;

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(0.6, { duration: 2000 }), -1, true));
    scale.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2000 }), -1, true));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    position: "absolute",
    top: `${top}%`,
    left: `${left}%`,
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
};

// --- Main Screen ---

export default function OnboardingScreen() {
  const router = useRouter();
  const { onboardingComplete, setName: setGlobalName, setOnboardingComplete, isLoading: isUserLoading } = useUser();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Transitions
  const screenOpacity = useSharedValue(1);
  const screenTranslateX = useSharedValue(0);

  useEffect(() => {
    if (!isUserLoading && onboardingComplete) {
      router.replace("/(tabs)");
    }
  }, [onboardingComplete, isUserLoading]);

  const switchStep = useCallback((nextStep: number) => {
    screenOpacity.value = withTiming(0, { duration: 300 }, () => {
      screenTranslateX.value = 50;
      setStep(nextStep);
      screenTranslateX.value = withTiming(0, { duration: 400 });
      screenOpacity.value = withTiming(1, { duration: 400 });
    });
  }, []);

  const handleNextStep = () => {
    if (step === 1) switchStep(2);
    else if (step === 2 && name.length >= 2) {
      setIsLoading(true);
      // Simulate a small delay for premium feel
      setTimeout(() => {
        setIsLoading(false);
        setGlobalName(name);
        switchStep(3);
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

  if (isUserLoading) return <View style={[styles.container, { backgroundColor: COLORS.background }]} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Orbs (Step 1 & 3) */}
      {(step === 1 || step === 3) && (
        <View style={StyleSheet.absoluteFill}>
          <FloatingOrb style={{ ...styles.orb1, backgroundColor: "rgba(244,162,74,0.12)" }} />
          <FloatingOrb style={{ ...styles.orb2, backgroundColor: "rgba(232,121,58,0.08)" }} delay={3000} />
          <FloatingOrb style={{ ...styles.orb3, backgroundColor: "rgba(244,162,74,0.05)" }} delay={5000} />
          <View style={styles.particlesContainer}>
            {[...Array(15)].map((_, i) => (
              <Particle key={i} delay={i * 300} />
            ))}
          </View>
        </View>
      )}

      {/* Persistent Logo Area */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/LOGO1.png")} 
          style={styles.logoImage} 
          resizeMode="contain"
        />
      </View>

      <Animated.View style={[styles.screenWrapper, animatedScreenStyle]}>
        {step === 1 && <StepOne onNext={handleNextStep} />}
        {step === 2 && <StepTwo name={name} setName={setName} onNext={handleNextStep} isLoading={isLoading} />}
        {step === 3 && <StepThree name={name} onExplore={handleExplore} />}
      </Animated.View>
    </View>
  );
}

// --- Step Views ---

const StepOne = ({ onNext }: { onNext: () => void }) => {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1.03, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const plateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const reverseRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-rotate.value * 0.6}deg` }],
  }));

  return (
    <View style={styles.stepContent}>
      {/* Logo */}
      {/* Logo moved to persistent wrapper */}

      {/* Hero */}
      <View style={styles.heroArea}>
        <View style={styles.plateWrap}>
          <Animated.View style={[styles.plateRing2, reverseRingStyle]} />
          <Animated.View style={[styles.plateRing, ringAnimatedStyle]}>
            <View style={styles.ringDot} />
          </Animated.View>
          <Animated.View style={[styles.plateCircle, plateAnimatedStyle]}>
            <Text style={{ fontSize: 80 }}>🥘</Text>
            <View style={[styles.orbitBadge, styles.badge1]}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>200+ recipes</Text>
            </View>
            <View style={[styles.orbitBadge, styles.badge2]}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>AI chef</Text>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        <View style={styles.slideDots}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.headline}>
          Cook with <Text style={styles.accentText}>passion,</Text>{"\n"}eat with joy.
        </Text>
        <Text style={styles.subheadline}>
          Discover thousands of recipes tailored to your taste. Your personal AI chef is ready.
        </Text>
        
        <TouchableOpacity style={styles.mainBtn} onPress={onNext} activeOpacity={0.8}>
          <LinearGradient
            colors={["#f4a24a", "#e06830"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn}
          >
            <Text style={styles.mainBtnText}>Get Started</Text>
            <View style={styles.btnArrow}>
              <Ionicons name="arrow-forward" size={16} color="#1a0e04" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.signinRow}>
          <Text style={styles.signinText}>Already have an account? </Text>
          <TouchableOpacity><Text style={styles.signinLink}>Sign in</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const StepTwo = ({ name, setName, onNext, isLoading }: {
  name: string;
  setName: (name: string) => void;
  onNext: () => void;
  isLoading: boolean;
}) => {
  return (
    <View style={styles.stepContent}>
      <View style={styles.s2Top}>
        <LinearGradient colors={["#1A1B1E", "#0E0E10"]} style={StyleSheet.absoluteFill} />
        <View style={styles.welcomeIconWrap}>
          <View style={styles.welcomeBowl}>
            <Text style={{ fontSize: 48 }}>👨‍🍳</Text>
          </View>
        </View>
      </View>

      <View style={styles.s2Content}>
        <Text style={styles.s2Label}>QUICK SETUP</Text>
        <Text style={styles.s2Title}>What should{"\n"}we call you?</Text>
        <Text style={styles.s2Sub}>We'll personalize your entire food journey around your preferences.</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>YOUR FIRST NAME</Text>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Alex, Priya, Marco..."
              placeholderTextColor={THEME.text3}
              value={name}
              onChangeText={setName}
              autoFocus
              selectionColor={THEME.accent}
            />
            <Text style={styles.inputIcon}>✦</Text>
          </View>
        </View>



        <TouchableOpacity 
          style={[styles.continueBtn, (name.length < 2 || isLoading) && styles.btnDisabled]} 
          onPress={onNext}
          disabled={name.length < 2 || isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#f4a24a", "#e06830"]}
            style={styles.gradientBtn}
          >
            {isLoading ? (
              <View style={styles.loadingDots}>
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
              </View>
            ) : (
              <Text style={styles.mainBtnText}>Let's Cook →</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const StepThree = ({ name, onExplore }: { name: string; onExplore: () => void }) => {
  const capName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <View style={styles.stepContent}>
      <View style={styles.welcomeAnim}>
        <View style={styles.wPlate}>
          <Text style={{ fontSize: 60 }}>🍽️</Text>
        </View>
        <View style={styles.checkmark}>
          <Ionicons name="checkmark" size={20} color="white" />
        </View>
      </View>

      <Text style={styles.welcomeName}>
        Welcome,{"\n"}<Text style={styles.accentText}>{capName || "Chef"}!</Text>
      </Text>
      <Text style={styles.welcomeTagline}>
        Your delicious journey starts now. Discover, cook, and savour every moment.
      </Text>

      <View style={styles.featureGrid}>
        <FeatureCard emoji="🔍" title="Explore Recipes" desc="200+ curated dishes" />
        <FeatureCard emoji="🤖" title="AI Chef" desc="Smart suggestions" />
        <FeatureCard emoji="🥗" title="Meal Planner" desc="Week-ready plans" />
        <FeatureCard emoji="🛒" title="Smart Cart" desc="Auto grocery lists" />
      </View>

      <TouchableOpacity style={styles.exploreBtn} onPress={onExplore} activeOpacity={0.8}>
        <LinearGradient
          colors={["#f4a24a", "#e06830"]}
          style={styles.gradientBtn}
        >
          <Text style={styles.mainBtnText}>Explore Yumly</Text>
          <Text style={{ fontSize: 18, marginLeft: 8 }}>🍴</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const FeatureCard = ({ emoji, title, desc }: { emoji: string; title: string; desc: string }) => (
  <View style={styles.featCard}>
    <Text style={styles.featEmoji}>{emoji}</Text>
    <Text style={styles.featTitle}>{title}</Text>
    <Text style={styles.featDesc}>{desc}</Text>
  </View>
);

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  screenWrapper: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Background
  orb: {
    position: "absolute",
    borderRadius: 150,
  },
  orb1: { width: 300, height: 300, top: -80, left: -60 },
  orb2: { width: 250, height: 250, bottom: 120, right: -80 },
  orb3: { width: 200, height: 200, top: "40%", left: "30%" },
  particlesContainer: { ...StyleSheet.absoluteFillObject },
  particle: {
    width: 2,
    height: 2,
    backgroundColor: THEME.accent,
    borderRadius: 1,
  },
  // Step 1
  logoContainer: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 40,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 60,
    zIndex: 10,
  },
  logoImage: {
    width: width * 0.45,
    height: 50,
  },
  heroArea: {
    height: 400,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  plateWrap: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  plateRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "rgba(244,162,74,0.15)",
  },
  plateRing2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "rgba(244,162,74,0.07)",
    borderStyle: "dashed",
  },
  ringDot: {
    position: "absolute",
    top: -4,
    left: "50%",
    width: 8,
    height: 8,
    backgroundColor: THEME.accent,
    borderRadius: 4,
    shadowColor: THEME.accent,
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  plateCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#1A1B1E",
    borderWidth: 1.5,
    borderColor: "rgba(244,162,74,0.15)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
  },
  orbitBadge: {
    position: "absolute",
    backgroundColor: THEME.bg3,
    borderWidth: 1,
    borderColor: "rgba(244,162,74,0.25)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  badge1: { top: -10, right: -20 },
  badge2: { bottom: 20, left: -30 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.accent },
  badgeText: { color: THEME.accent, fontSize: 12, fontWeight: "500" },
  bottomContent: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 40,
    marginTop: "auto",
  },
  slideDots: { flexDirection: "row", justifyContent: "center", gap: 6, marginBottom: 32 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.text3 },
  activeDot: { width: 24, backgroundColor: THEME.accent },
  headline: {
    fontSize: 42,
    fontWeight: "600",
    color: THEME.text,
    lineHeight: 46,
    marginBottom: 14,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  accentText: { color: THEME.accent },
  subheadline: { fontSize: 15, color: THEME.text2, lineHeight: 24, marginBottom: 32 },
  mainBtn: { width: "100%", borderRadius: 18, overflow: "hidden" },
  gradientBtn: {
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  mainBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  btnArrow: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(26,14,4,0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  signinRow: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  signinText: { color: THEME.text3, fontSize: 13 },
  signinLink: { color: THEME.accent, fontSize: 13, fontWeight: "500" },
  // Step 2
  s2Top: { width: "100%", height: 300, justifyContent: "center", alignItems: "center" },
  welcomeIconWrap: { marginTop: 40 },
  welcomeBowl: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1A1B1E",
    borderWidth: 1.5,
    borderColor: "rgba(244,162,74,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  s2Content: {
    flex: 1,
    width: "100%",
    backgroundColor: THEME.bg,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -36,
    padding: 32,
  },
  s2Label: { color: THEME.accent, fontSize: 12, fontWeight: "bold", letterSpacing: 1, marginBottom: 10 },
  s2Title: {
    fontSize: 36,
    fontWeight: "600",
    color: THEME.text,
    lineHeight: 40,
    marginBottom: 10,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  s2Sub: { fontSize: 14, color: THEME.text2, lineHeight: 22, marginBottom: 36 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, color: THEME.text3, fontWeight: "500", marginBottom: 10 },
  inputWrap: { flexDirection: "row", alignItems: "center" },
  nameInput: {
    flex: 1,
    backgroundColor: THEME.bg3,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    color: THEME.text,
    fontSize: 16,
  },
  inputIcon: { position: "absolute", right: 16, color: THEME.accent, opacity: 0.4 },

  continueBtn: { width: "100%", borderRadius: 18, overflow: "hidden" },
  btnDisabled: { opacity: 0.4 },
  loadingDots: { flexDirection: "row", gap: 5 },
  loadingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  // Step 3
  welcomeAnim: { marginBottom: 32, position: "relative" },
  wPlate: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#1A1B1E",
    borderWidth: 2,
    borderColor: "rgba(244,162,74,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    backgroundColor: THEME.accent,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: THEME.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeName: {
    fontSize: 42,
    fontWeight: "600",
    color: THEME.text,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 12,
  },
  welcomeTagline: { fontSize: 15, color: THEME.text2, textAlign: "center", lineHeight: 24, marginBottom: 44, paddingHorizontal: 20 },
  featureGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  featCard: {
    width: (width - 64 - 12) / 2,
    backgroundColor: THEME.bg3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    borderRadius: 18,
    padding: 16,
  },
  featEmoji: { fontSize: 26, marginBottom: 8 },
  featTitle: { color: THEME.text, fontSize: 13, fontWeight: "500", marginBottom: 3 },
  featDesc: { color: THEME.text3, fontSize: 11 },
  exploreBtn: { width: width - 64, borderRadius: 18, overflow: "hidden" },
});
