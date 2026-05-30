import React, { useRef } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  interpolateColor,
} from "react-native-reanimated";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function SearchBar({ value, onChangeText, onFocus, onBlur, onSubmitEditing }: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const focusProgress = useSharedValue(0);
  const containerAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      ["rgba(245, 240, 235, 0.06)", "rgba(232, 168, 56, 0.3)"]
    ),
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [COLORS.bg3, COLORS.elevated]
    ),
  }));

  const handleFocus = () => {
    focusProgress.value = withTiming(1, { duration: 300 });
    onFocus?.();
  };

  const handleBlur = () => {
    focusProgress.value = withTiming(0, { duration: 300 });
    onBlur?.();
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <AnimatedView style={[styles.container, containerAnimStyle]}>
        <TextInput
          ref={inputRef}
          placeholder="Search recipes, ingredients..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          selectionColor={COLORS.primary}
        />
        {value.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => onChangeText("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.clearCircle}>
              <Ionicons name="close" size={12} color={COLORS.text} />
            </View>
          </Pressable>
        )}
      </AnimatedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.m,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: RADIUS.l,
    marginVertical: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    marginLeft: SPACING.s + 2,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 6,
    fontWeight: "400",
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.bg3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
