import { setAudioModeAsync } from "expo-audio";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { MealPlanProvider } from "../src/context/MealPlanContext";
import { UserProvider } from "../src/context/UserContext";
import { COLORS } from "../src/constants/theme";

export default function RootLayout() {
  useEffect(() => {
    async function setupAudio() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: "doNotMix",
        });
      } catch (e) {
        console.log("Error setting audio mode", e);
      }
    }
    setupAudio();
  }, []);

  return (
    <UserProvider>
      <FavoritesProvider>
        <MealPlanProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: COLORS.background },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="recipe/[id]"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </MealPlanProvider>
      </FavoritesProvider>
    </UserProvider>
  );
}
