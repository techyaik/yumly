import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RADIUS, SHADOWS, SPACING } from "../../src/constants/theme";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useMealPlan } from "../../src/context/MealPlanContext";
import { useTheme } from "../../src/context/ThemeContext";

const TAB_ITEMS = [
  { name: "index", title: "Explore", iconActive: "compass", iconInactive: "compass-outline" },
  { name: "favorites", title: "Saved", iconActive: "bookmark", iconInactive: "bookmark-outline" },
  { name: "mealplan", title: "Kitchen", iconActive: "flame", iconInactive: "flame-outline" },
  { name: "settings", title: "Settings", iconActive: "cog", iconInactive: "cog-outline" },
] as const;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const { favorites = [] } = useFavorites();
  const { meals = [] } = useMealPlan();
  const insets = useSafeAreaInsets();
  const favoritesCount = favorites.length;
  const mealPlanCount = meals.length;

  return (
    <View style={StyleSheet.flatten([styles.tabBarWrapper, { paddingBottom: Math.max(insets.bottom, 8) }])}>
      <View style={[styles.tabBarContainer, { borderColor: colors.borderLight }]}>
        <View style={[styles.tabBarGlass, { backgroundColor: colors.tabBarBg, borderColor: colors.borderLight }]} />
        
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const tab = TAB_ITEMS[index];
            if (!tab) return null;

            const iconName = isFocused ? tab.iconActive : tab.iconInactive;
            const showBadge =
              (tab.name === "favorites" && favoritesCount > 0) ||
              (tab.name === "mealplan" && mealPlanCount > 0);
            const badgeCount =
              tab.name === "favorites" ? favoritesCount : mealPlanCount;

            return (
              <Pressable
                key={route.key}
                onPress={() => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
                style={styles.tabItem}
              >
                <Animated.View
                  style={StyleSheet.flatten([
                    styles.tabContent,
                    isFocused && { backgroundColor: colors.primaryLight },
                  ])}
                >
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name={iconName as any}
                      size={20}
                      color={isFocused ? colors.primary : colors.textMuted}
                    />
                    {showBadge && (
                      <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.surface }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>
                          {badgeCount > 9 ? "9+" : badgeCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={StyleSheet.flatten([
                      styles.tabLabel,
                      { color: colors.textMuted },
                      isFocused && { color: colors.primary, fontWeight: "700" },
                    ])}
                  >
                    {tab.title}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="mealplan" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    backgroundColor: "transparent",
  },
  tabBarContainer: {
    borderRadius: RADIUS.xxl,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  tabBarGlass: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: RADIUS.xxl,
  },
  tabBarInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: SPACING.s + 2,
    paddingHorizontal: SPACING.s,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.m,
    borderRadius: RADIUS.l,
  },
  iconWrapper: {
    position: "relative",
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "bold",
  },
});
