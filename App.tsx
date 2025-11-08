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
import { ReduxProvider } from "@/providers/ReduxProvider";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useAutoSync } from "@/hooks/useAutoSync";
import OfflineIndicator from "@/components/OfflineIndicator";
import { View } from "react-native";
import { useRoadmap } from "@/context/roadmap";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function AsyncContainer () {
  const { refresh, getCashPayments } = useRoadmap()
  
  const refreshData = () => {
    refresh()
    getCashPayments()
  }
    // Inicializar sincronización automática
  useAutoSync(refreshData);
  return (
    <View></View>
  )
}

function AppContent() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [fontsLoaded] = useFonts({
    "Futura-Bold": require("./src/assets/fonts/Futura-Bold.otf"),
  });

  // Inicializar el hook de estado de red
  useNetworkStatus();
  

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
      <AsyncContainer />
      <OfflineIndicator />
    </AppProviders>
  );
}

export default function App() {
  return (
    <ReduxProvider>
      <AppContent />
    </ReduxProvider>
  );
}
