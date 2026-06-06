import { setAudioModeAsync } from "expo-audio";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { dark } from "../src/constants/theme";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { MealPlanProvider } from "../src/context/MealPlanContext";
import { ThemeProvider } from "../src/context/ThemeContext";
import { UserProvider } from "../src/context/UserContext";

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
    <ThemeProvider>
      <UserProvider>
        <FavoritesProvider>
          <MealPlanProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: dark.background },
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="recipe/[id]"
                    options={{
                      presentation: "modal",
                    }}
                  />
                  <Stack.Screen
                    name="cooking/[id]"
                    options={{
                      presentation: "fullScreenModal",
                    }}
                  />
                </Stack>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </MealPlanProvider>
        </FavoritesProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
