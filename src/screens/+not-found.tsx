import { Link, Stack } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

export default function NotFoundScreen() {
  return (
    <ProtectedRoute>
      <ScrollView>
        <Stack.Screen options={{ title: "Oops!" }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Esta Pagina no existe.</ThemedText>
          <Link href="Home" style={styles.link}>
            <ThemedText type="link">Volver al Inicio!</ThemedText>
          </Link>
        </ThemedView>
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
