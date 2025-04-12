import { clearAuthData } from "@/api";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading.utils";
import { useNotifications } from "@/context/notification";
import AppProviders from "@/context/providers";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { GestureResponderEvent, Image, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

const LoginScreen = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigation = useNavigation()

  const { login } = useAuth();
  const { showSnackbar } = useNotifications();
  const { setLoading, isLoading: loading } = useLoading();

  const validateErrors = () => {
    if (!username) {
      return "El campo usuario no puede estar vacio.";
    }
    if (!password) {
      return "El campo contraseña no puede estar vacio.";
    }
    return null;
  };

  const handleLogin = async (e: GestureResponderEvent) => {
    setLoading(true);
    try {
      e.preventDefault();

      const errors = validateErrors();
      if (errors) {
        showSnackbar(errors, "error");
        setLoading(false);
        return;
      }

      if (username && password) {
        await login(username, password);
        setTimeout(() => {
          setLoading(false);
          navigation.navigate("Home");
        }, 200);
      }
    } catch (e) {
      setUsername("");
      setPassword("");
      clearAuthData();
      let message =
        "Error en el inicio de sesión: Usuario o contraseña incorrectos. Por favor, verifica tus datos e inténtalo de nuevo.";
      if (e?.message === "disabled-user") {
        message =
          "La cuenta está desactivada. Para más información, por favor contacta al soporte.";
      }
      showSnackbar(message, "error");
      setLoading(false);
    }
  };

  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.center} variant="titleMedium">
        Bienvenido a
      </Text>
      <Image
        source={require("../../assets/images/tremma-lg.png")}
        style={{ width: 160, height: 120, alignSelf: "center" }}
      />
      <Text style={{ ...styles.center, marginBottom: 40 }}>
        {" "}
        Inicia sesión para ingresar al sistema:
      </Text>
      <View>
        {/* Email Input */}
        <TextInput
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          disabled={loading}
          mode="outlined"
          left={<TextInput.Icon icon="email" />}
        />

        {/* Password Input */}
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          disabled={loading}
          style={{ ...styles.input, marginBottom: 40 }}
          mode="outlined"
          left={<TextInput.Icon icon="lock" />}
        />

        {/* Login Button */}
        <Button
          theme={theme}
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingTop: 16, // Evita solapamiento con la StatusBar en Android
  },
  center: {
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
});


export default LoginScreen;
