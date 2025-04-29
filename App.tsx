import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";
import {
  darkTheme,
  defaultNavigationTheme,
  defaultTheme,
  navigationDarkTheme,
} from "@/constants/theme";
import * as SplashScreen from "expo-splash-screen";
import { ThemedView } from "@/components/ThemedView";
import { useFonts } from "expo-font";
import ErrorBoundary from "./src/components/ErrorBoundary";
import AppProviders from "@/context/providers";
import { navigationRef } from "@/utils/navigation";
import { ConnectivityProvider } from "@/context/connection";
import { useNotificationSetup } from "@/utils/notifications";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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

  const colorScheme = useColorScheme();
  const { LightTheme, DarkTheme: DarkNavTheme } = adaptNavigationTheme({
    reactNavigationLight: defaultNavigationTheme,
    reactNavigationDark: navigationDarkTheme,
    materialLight: defaultTheme,
    materialDark: darkTheme,
  });

  const CombinedDefaultTheme = {
    ...LightTheme,
    ...defaultTheme,
    colors: {
      ...LightTheme.colors,
      ...defaultTheme.colors,
    },
  };
  const CombinedDarkTheme = {
    ...DarkNavTheme,
    ...darkTheme,
    colors: {
      ...DarkNavTheme.colors,
      ...darkTheme.colors,
    },
  };

  if (!appIsReady || !fontsLoaded) {
    return <ActivityIndicator />;
  }

  const theme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <BottomSheetModalProvider>
          <ConnectivityProvider>
            <NavigationContainer theme={theme} ref={navigationRef}>
              <ErrorBoundary>
                <AppProviders>
                  <Router />
                  <StatusBar style="auto" />
                  <ThemedView onLayout={onLayoutRootView} />
                </AppProviders>
              </ErrorBoundary>
            </NavigationContainer>
          </ConnectivityProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
