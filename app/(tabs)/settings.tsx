import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, RADIUS, SHADOWS, SPACING } from "../../src/constants/theme";
import { useTheme } from "../../src/context/ThemeContext";
import { useUser } from "../../src/context/UserContext";

const appJson = require("../../app.json");
const APP_VERSION = appJson?.expo?.version ?? "1.0.0";

const THEME_OPTIONS = [
  { mode: "system" as const, label: "System", icon: "settings-outline" as const, desc: "Follow device settings" },
  { mode: "dark" as const, label: "Dark", icon: "moon-outline" as const, desc: "Always dark appearance" },
  { mode: "light" as const, label: "Light", icon: "sunny-outline" as const, desc: "Always light appearance" },
];

export default function SettingsScreen() {
  const { colors, mode: currentMode, setMode } = useTheme();
  const { name, setName, recipesCooked } = useUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  const handleSaveName = () => {
    if (nameValue.trim().length >= 2) {
      setName(nameValue.trim());
      setIsEditingName(false);
    }
  };

  const handleThemeSelect = (selected: "system" | "dark" | "light") => {
    setMode(selected);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle={currentMode === "light" ? "dark-content" : "light-content"} />

      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: colors.primary }]}>PREFERENCES</Text>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PROFILE</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.small]}>
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Name</Text>
              {isEditingName ? (
                <TextInput
                  style={[styles.nameInput, { backgroundColor: colors.elevated, borderColor: colors.border, color: colors.text }]}
                  value={nameValue}
                  onChangeText={setNameValue}
                  autoFocus
                  selectionColor={colors.primary}
                  onSubmitEditing={handleSaveName}
                  onBlur={handleSaveName}
                  returnKeyType="done"
                />
              ) : (
                <Pressable onPress={() => { setNameValue(name); setIsEditingName(true); }}>
                  <Text style={[styles.rowValue, { color: colors.text }]}>{name || "Chef"}</Text>
                </Pressable>
              )}
            </View>
            <Ionicons name="create-outline" size={16} color={colors.textMuted} />
          </View>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="flame-outline" size={20} color={colors.secondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Recipes Cooked</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{recipesCooked}</Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.small]}>
          {THEME_OPTIONS.map((option, idx) => {
            const isActive = currentMode === option.mode;
            const isLast = idx === THEME_OPTIONS.length - 1;
            return (
              <Pressable
                key={option.mode}
                onPress={() => handleThemeSelect(option.mode)}
                style={[
                  styles.row,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.rowIcon, { backgroundColor: isActive ? colors.primaryLight : colors.elevated }]}>
                  <Ionicons name={option.icon} size={20} color={isActive ? colors.primary : colors.textMuted} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowValue, { color: colors.text }]}>{option.label}</Text>
                  <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{option.desc}</Text>
                </View>
                <View style={[styles.radio, { borderColor: isActive ? colors.primary : colors.border }]}>
                  {isActive && <View style={[styles.radioFill, { backgroundColor: colors.primary }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* About Section */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, SHADOWS.small]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: colors.elevated }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Version</Text>
              <Text style={[styles.rowValue, { color: colors.text, fontFamily: FONTS.mono }]}>{APP_VERSION}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Yumly</Text>
          <Text style={[styles.footerSub, { color: colors.textMuted }]}>Made with passion</Text>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.m,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: FONTS.mono,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: FONTS.serif,
  },
  scrollContent: {
    paddingTop: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: SPACING.s,
    paddingHorizontal: SPACING.m,
    fontFamily: FONTS.mono,
  },
  card: {
    marginHorizontal: SPACING.m,
    marginBottom: SPACING.l,
    borderRadius: RADIUS.l,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    gap: SPACING.m,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  nameInput: {
    borderWidth: 1.5,
    borderRadius: RADIUS.m,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "600",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.l,
  },
  footerText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: FONTS.serif,
  },
  footerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  footerSpacer: {
    height: 120,
  },
});
