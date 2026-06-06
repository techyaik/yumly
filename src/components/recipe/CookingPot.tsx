import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { SHADOWS, FONTS } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

const staticStyles = StyleSheet.create({
  steam: {
    width: 18,
    height: 18,
    backgroundColor: "rgba(200, 200, 200, 0.3)",
    borderRadius: 9,
    position: "absolute",
  },
});

interface CookingPotProps {
  isActive: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
}

const SteamParticle = ({
  delay,
  isActive,
}: {
  delay: number;
  isActive: boolean;
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      translateY.value = withRepeat(
        withDelay(
          delay,
          withTiming(-60, {
            duration: 2000,
            easing: Easing.out(Easing.ease),
          })
        ),
        -1,
        false
      );
      translateX.value = withRepeat(
        withDelay(
          delay,
          withSequence(
            withTiming(15, { duration: 1000 }),
            withTiming(-15, { duration: 1000 })
          )
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withDelay(
          delay,
          withSequence(
            withTiming(0.5, { duration: 500 }),
            withTiming(0, { duration: 1500 })
          )
        ),
        -1,
        false
      );
    } else {
      translateY.value = 0;
      opacity.value = 0;
      translateX.value = 0;
    }
  }, [isActive, delay, translateY, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[staticStyles.steam, animatedStyle]} />;
};

export default function CookingPot({
  isActive,
  timeLeft,
  formatTime,
}: CookingPotProps) {
  const { colors } = useTheme();
  const jiggle = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      jiggle.value = withRepeat(
        withSequence(
          withTiming(-1.5, { duration: 50 }),
          withTiming(1.5, { duration: 50 })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withTiming(1.02, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1200 }),
          withTiming(0.2, { duration: 1200 })
        ),
        -1,
        true
      );
    } else {
      jiggle.value = withTiming(0);
      scale.value = withTiming(1);
      glowOpacity.value = withTiming(0);
    }
  }, [isActive, jiggle, scale, glowOpacity]);

  const potAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${jiggle.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const styles = useMemo(() => StyleSheet.create({
    container: {
      height: 240,
      width: 240,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    ambientGlow: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.primary,
      opacity: 0,
    },
    steamContainer: {
      position: "absolute",
      top: 10,
      width: 60,
      height: 60,
      alignItems: "center",
    },
    potWrapper: {
      alignItems: "center",
      zIndex: 2,
    },
    potHandle: {
      width: 28,
      height: 12,
      backgroundColor: colors.bg3,
      borderTopLeftRadius: 6,
      borderTopRightRadius: 6,
      marginBottom: -2,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: colors.border,
    },
    potLid: {
      width: 140,
      height: 16,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      borderBottomWidth: 2,
      borderBottomColor: "rgba(0,0,0,0.15)",
      ...SHADOWS.small,
    },
    potBody: {
      width: 160,
      height: 110,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      ...SHADOWS.medium,
    },
    potShine: {
      position: "absolute",
      top: 10,
      left: 15,
      width: 28,
      height: 55,
      backgroundColor: "rgba(255,255,255,0.15)",
      borderRadius: 14,
      transform: [{ rotate: "15deg" }],
    },
    sideHandle: {
      position: "absolute",
      width: 22,
      height: 36,
      backgroundColor: colors.bg3,
      top: 55,
      borderRadius: 8,
      zIndex: -1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    leftHandle: {
      left: -14,
    },
    rightHandle: {
      right: -14,
    },
    timeWrapper: {
      alignItems: "center",
    },
    timeText: {
      fontSize: 36,
      fontWeight: "800",
      color: "#1A0E04",
      fontFamily: FONTS.mono,
    },
    statusText: {
      fontSize: 9,
      fontWeight: "800",
      color: "rgba(26,14,4,0.5)",
      letterSpacing: 3,
      marginTop: -2,
      fontFamily: FONTS.mono,
    },
    burnerBase: {
      width: 140,
      height: 6,
      backgroundColor: colors.bg3,
      borderRadius: 3,
      marginTop: -5,
      zIndex: 1,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heatGlow: {
      position: "absolute",
      top: -12,
      left: 20,
      width: 100,
      height: 18,
      backgroundColor: "rgba(232, 168, 56, 0.35)",
      borderRadius: 10,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      {/* Ambient glow */}
      <Animated.View style={[styles.ambientGlow, glowAnimatedStyle]} />

      {/* Steam Particles */}
      <View style={styles.steamContainer}>
        <SteamParticle delay={0} isActive={isActive} />
        <SteamParticle delay={600} isActive={isActive} />
        <SteamParticle delay={1200} isActive={isActive} />
      </View>

      {/* Pot Component */}
      <Animated.View style={[styles.potWrapper, potAnimatedStyle]}>
        {/* Pot Lid Handle */}
        <View style={styles.potHandle} />

        {/* Pot Lid */}
        <View style={styles.potLid} />

        {/* Pot Body */}
        <View style={styles.potBody}>
          <View style={styles.timeWrapper}>
            <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.statusText}>
              {isActive ? "COOKING" : "READY"}
            </Text>
          </View>

          {/* Decorative Pot "Shine" */}
          <View style={styles.potShine} />
        </View>

        {/* Side Handles */}
        <View style={[styles.sideHandle, styles.leftHandle]} />
        <View style={[styles.sideHandle, styles.rightHandle]} />
      </Animated.View>

      {/* Burner/Heat Base */}
      <View style={styles.burnerBase}>
        {isActive && <View style={styles.heatGlow} />}
      </View>
    </View>
  );
}
