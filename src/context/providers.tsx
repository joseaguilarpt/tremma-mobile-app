import { ReactNode, useEffect } from "react";
import { AuthProvider, useAuth } from "./auth";
import { LoadingProvider } from "./loading";
import { SnackbarProvider } from "./notification";
import { Text, Banner } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useConnectivity } from "./connection.utils";
import * as BackgroundFetch from "expo-background-fetch";
import { BACKGROUND_TASK_NAME } from "@/notifications/config";

const ConnectPush = () => {
  useEffect(() => {
    const registerTask = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
          minimumInterval: 60 * 60, // Ejecutar cada 1 hora
          stopOnTerminate: false, // Continuar después de cerrar la app (solo Android)
          startOnBoot: true, // Iniciar al reiniciar el dispositivo (solo Android)
        });
        console.log("Tarea registrada correctamente.");
      } catch (error) {
        console.error("Error al registrar la tarea:", error);
      }
    };
    registerTask();
  }, []);
  return null;
};

function AppProviders({ children }: { children: ReactNode }) {
  const { isConnected } = useConnectivity();
  return (
    <AuthProvider>
      <LoadingProvider>
        <SnackbarProvider>
          {children}
          {!isConnected && (
            <Banner style={styles.banner} visible={true}>
              <Text variant="labelSmall" style={styles.bannerMessage}>
                Sin conexion a internet
              </Text>
            </Banner>
          )}
          <ConnectPush />
        </SnackbarProvider>
      </LoadingProvider>
    </AuthProvider>
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
