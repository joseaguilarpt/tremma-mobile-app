import React from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";
import { ThemedView } from "@/components/ThemedView";
import { useFonts } from "expo-font";
import AppProviders from "@/context/providers";
import { useNotificationSetup } from "@/utils/notifications";
import "react-native-gesture-handler";
import Router from "./Router";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [fontsLoaded] = useFonts({
    "Futura-Bold": require("./src/assets/fonts/Futura-Bold.otf"),
  });

  React.useEffect(() => {
    async function prepare() {
      setAppIsReady(true);
    }

    prepare();
  }, []);

  useNotificationSetup();

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      // Hide the splash screen
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <AppProviders>
      <Router />
      <StatusBar style="auto" />
      <ThemedView onLayout={onLayoutRootView} />
    </AppProviders>
  );
}
