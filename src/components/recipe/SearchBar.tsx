import React, { useRef } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SPACING, RADIUS } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
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

export default React.memo(function SearchBar({ value, onChangeText, onFocus, onBlur, onSubmitEditing }: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  const focusProgress = useSharedValue(0);
  const containerAnimStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.border, colors.borderAccent]
    ),
    backgroundColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [colors.bg3, colors.elevated]
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
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          selectionColor={colors.primary}
        />
        {value.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => onChangeText("")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.clearCircle, { backgroundColor: colors.textMuted, borderColor: colors.border }]}>
              <Ionicons name="close" size={14} color={colors.background} />
            </View>
          </Pressable>
        )}
      </AnimatedView>
    </Pressable>
  );
});

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
  },
  input: {
    flex: 1,
    marginLeft: SPACING.s + 2,
    fontSize: 15,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
