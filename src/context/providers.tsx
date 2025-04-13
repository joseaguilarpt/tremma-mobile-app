import { ReactNode } from "react";
import { AuthProvider } from "./auth";
import { LoadingProvider } from "./loading";
import { SnackbarProvider } from "./notification";
import { Text, Banner } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useConnectivity } from "./connection.utils";

function AppProviders({ children }: { children: ReactNode }) {
  const { isConnected} = useConnectivity()
  return (
    <AuthProvider>
      <LoadingProvider>
        <SnackbarProvider>
          {children}
          {!isConnected && <Banner style={styles.banner} visible={true}>
            <Text variant="labelSmall" style={styles.bannerMessage}>
              Sin conexion a internet
            </Text>
          </Banner>}
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
