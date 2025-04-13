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
import { logout } from "@/api";
import { useNotifications } from "@/context/notification";

function SettingsScreen() {
  const theme = useTheme();
  const { setLoading, isLoading: loading } = useLoading();
  const { showSnackbar } = useNotifications();
  const { user, imageSrc } = useAuth();
  const navigation = useNavigation();

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
              label={user.name.charAt(0)}
            />
          )}
        </View>
        <View style={styles.flex}>
          <Text variant="titleMedium">Usuario</Text>
          <Text>
            {" "}
            {user.name} {user.lastname} ({user.username})
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingTop: 16, // Evita solapamiento con la StatusBar en Android
  },
  divider: {
    margin: 16,
  },
  avatar: {
    marginLeft: 10,
  },
  settings: {
    flexDirection: "row", // Llenar las filas de manera horizontal
    flexWrap: "wrap", // Permite que los elementos se muevan a la siguiente línea
    //alignItems: "center", // Alineación vertical
    justifyContent: "flex-start", // Alineación entre los elementos    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
  },
  flex: {
    paddingLeft: 20,
    // display: 'flex'
  },
});

export default SettingsScreen;
