import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import { useNavigation } from "@react-navigation/native";
import {
  Text,
  useTheme,
  Appbar,
  Avatar,
  Divider,
  Button,
} from "react-native-paper";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading.utils";
import { useNotifications } from "@/context/notification";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/Routes";

function SettingsScreen() {
  const theme = useTheme();
  const { setLoading, isLoading: loading } = useLoading();
  const { showSnackbar } = useNotifications();
  const { user, imageSrc, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigation.navigate("Login");
      showSnackbar("Sesión finalizada exitosamente.", "success");
    } catch (e) {
      showSnackbar("Error cerrando la sesión, vuelva a intentarlo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <ScrollView>
        <Appbar.Header>
          <Appbar.Content title="Cuenta de Usuario:" />
        </Appbar.Header>

        <View style={styles.settings}>
          <View>
            {imageSrc && (
              <Avatar.Image
                style={styles.avatar}
                size={50}
                source={{ uri: imageSrc }}
              />
            )}
            {!imageSrc && (
              <Avatar.Text
                style={styles.avatar}
                size={50}
                label={user?.name?.charAt(0)}
              />
            )}
          </View>
          <View style={styles.flex}>
            <Text variant="titleMedium">Usuario</Text>
            <Text>
              {" "}
              {user?.name} {user?.lastname} ({user?.username})
            </Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        <View style={{ ...styles.settings, justifyContent: "space-between" }}>
          <Button
            icon="eye"
            disabled={loading}
            mode="contained"
            style={{ backgroundColor: theme.colors.onSecondary, width: "100%" }}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            Cambiar Contraseña
          </Button>
        </View>
        <Divider style={styles.divider} />
        <View style={{ ...styles.settings, justifyContent: "space-between" }}>
          <Button
            icon="close"
            mode="contained"
            style={{ width: "100%" }}
            disabled={loading}
            onPress={handleLogout}
          >
            Cerrar Sesion
          </Button>
        </View>
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  divider: {
    margin: 16,
  },
  avatar: {
    marginLeft: 10,
  },
  settings: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
  },
  flex: {
    paddingLeft: 20,
  },
});

export default SettingsScreen;
