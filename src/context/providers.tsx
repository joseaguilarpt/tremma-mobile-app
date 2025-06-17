import { ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "./auth";
import { LoadingProvider } from "./loading";
import { SnackbarProvider } from "./notification";
import {
  Text,
  Banner,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";
import { StyleSheet, useColorScheme } from "react-native";
import { useConnectivity } from "./connection.utils";
import * as BackgroundTask from "expo-background-task";
import { BACKGROUND_TASK_NAME } from "@/notifications/config";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { ConnectivityProvider } from "./connection";
import { NavigationContainer } from "@react-navigation/native";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  darkTheme,
  defaultNavigationTheme,
  defaultTheme,
  navigationDarkTheme,
} from "@/constants/theme";
import { navigationRef } from "@/utils/navigation";
import { RoadmapProvider } from "./roadmap";
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const ConnectPush = () => {
  useEffect(() => {
    registerBackgroundTask();
    askNotificationPermission();
  }, []);

  async function askNotificationPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    console.log("Notification permission:", status);
  }

  async function registerBackgroundTask() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_TASK_NAME
      );
      if (!isRegistered) {
        await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 15 * 60, // 15 min mínimo
        });
        console.log("✅ Background task registered");
      }
    } catch (err) {
      console.error("Error registering background task:", err);
    }
  }
  return null;
};

function AppProviders({ children }: { children: ReactNode }) {
  const { isConnected } = useConnectivity();

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

  const theme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <BottomSheetModalProvider>
          <ConnectivityProvider>
            <NavigationContainer theme={theme} ref={navigationRef}>
              <ErrorBoundary>
                <AuthProvider>
                  <LoadingProvider>
                    <SnackbarProvider>
                      <RoadmapProvider>
                        {children}
                        {!isConnected && (
                          <Banner style={styles.banner} visible={true}>
                            <Text
                              variant="labelSmall"
                              style={styles.bannerMessage}
                            >
                              Sin conexion a internet
                            </Text>
                          </Banner>
                        )}
                        <ConnectPush />
                      </RoadmapProvider>
                    </SnackbarProvider>
                  </LoadingProvider>
                </AuthProvider>
              </ErrorBoundary>
            </NavigationContainer>
          </ConnectivityProvider>
        </BottomSheetModalProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default AppProviders;

const styles = StyleSheet.create({
  banner: {
    height: 30,
    margin: 0,
    padding: 0,
    paddingBottom: 10,
    backgroundColor: "red",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerMessage: { textAlign: "center", fontWeight: "bold" },
});
