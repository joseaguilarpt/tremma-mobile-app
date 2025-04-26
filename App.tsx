import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import HomeView from "./src/screens/HomeScreen";
import NotFoundScreen from "./src/screens/+not-found";
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
import LoginScreen from "@/screens/LoginScreen";
import AppProviders from "@/context/providers";
import ChangePassword from "@/screens/Account/ChangePassword";
import Messages from "@/screens/Messages/Messages";
import SettingsScreen from "@/screens/Settings";
import AddMessage from "@/screens/Messages/AddMessage";
import { navigationRef } from "@/utils/navigation";
import { ConnectivityProvider } from "@/context/connection";
import { sendNotification, useNotificationSetup } from "@/utils/notifications";
import Roadmap from "@/screens/Roadmap";
import RoadmapView from "@/screens/RoadmapScreen";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function Router() {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen
        name="Home"
        component={HomeView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Roadmap"
        component={RoadmapView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cuenta"
        component={HomeView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMessage"
        component={AddMessage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [fontsLoaded] = useFonts({
    "Futura-Bold": require("./src/assets/fonts/Futura-Bold.otf"),
  });

  React.useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading resources (e.g., fonts, API calls)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
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
    return <ActivityIndicator />; // Render nothing while loading resources
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
