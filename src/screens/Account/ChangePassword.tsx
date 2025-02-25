import { getSettings } from "@/api/settings";
import { useAuth } from "@/context/auth";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Card,
  Text,
  TextInput,
  Button,
  IconButton,
  HelperText,
  Appbar,
  useTheme,
} from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";

export default function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSettings, setPasswordSettings] = useState([]);
  const [validationResults, setValidationResults] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigation = useNavigation();
  const { user } = useAuth();
const theme = useTheme();
  const generateValidationRules = (password: string) => {
    return passwordSettings.map((setting) => {
      const validate = (): boolean => {
        switch (setting.Codigo) {
          case "caracteres_clave":
            return password.length >= parseInt(setting.Valor1, 10);
          case "mayusculas_clave":
            return setting.Valor1 === "true"
              ? (password.match(/[A-Z]/g) || []).length >=
                  parseInt(setting.Valor2 || "0", 10)
              : true;
          case "minusculas_clave":
            return setting.Valor1 === "true"
              ? (password.match(/[a-z]/g) || []).length >=
                  parseInt(setting.Valor2 || "0", 10)
              : true;
          case "numeros_clave":
            return setting.Valor1 === "true"
              ? (password.match(/\d/g) || []).length >=
                  parseInt(setting.Valor2 || "0", 10)
              : true;
          case "especiales_clave":
            return setting.Valor1 === "true"
              ? (password.match(/[^a-zA-Z0-9]/g) || []).length >=
                  parseInt(setting.Valor2 || "0", 10)
              : true;
          default:
            return true;
        }
      };

      const description = (() => {
        switch (true) {
          case setting.Codigo === "caracteres_clave":
            return `La contraseña debe tener al menos ${setting.Valor1} caracteres.`;
          case setting.Codigo === "mayusculas_clave" &&
            setting.Valor1 === "true":
            return `La contraseña debe tener al menos ${setting.Valor2} letra(s) mayúscula(s).`;
          case setting.Codigo === "minusculas_clave" &&
            setting.Valor1 === "true":
            return `La contraseña debe tener al menos ${setting.Valor2} letra(s) minúscula(s).`;
          case setting.Codigo === "numeros_clave" && setting.Valor1 === "true":
            return `La contraseña debe tener al menos ${setting.Valor2} número(s).`;
          case setting.Codigo === "especiales_clave" &&
            setting.Valor1 === "true":
            return `La contraseña debe tener al menos ${setting.Valor2} caracter(es) especial(es).`;
          default:
            return "";
        }
      })();

      return {
        id: setting.Id,
        description,
        validation: validate,
      };
    });
  };

  // Validation logic
  const validatePassword = (password) => {
    return passwordSettings.map((setting) => {
      let isValid = false;
      switch (setting.key) {
        case "MIN_LENGTH":
          isValid = password.length >= setting.value;
          break;
        case "UPPERCASE_LETTER":
          isValid = (password.match(/[A-Z]/g) || []).length >= setting.value;
          break;
        case "LOWERCASE_LETTER":
          isValid = (password.match(/[a-z]/g) || []).length >= setting.value;
          break;
        case "NUMERIC":
          isValid = (password.match(/\d/g) || []).length >= setting.value;
          break;
        case "SPECIAL_CHARS":
          isValid =
            (password.match(/[^a-zA-Z0-9]/g) || []).length >= setting.value;
          break;
        default:
          isValid = true;
      }
      return { ...setting, isValid };
    });
  };

  // Handle password change submission
  const handleChangePassword = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const errors = validationResults.filter((result) => !result.isValid);
    if (errors.length > 0) {
      alert("Please fix the validation errors.");
      return;
    }

    // Simulate successful password update
    alert("Password updated successfully!");
    setPassword("");
    setConfirmPassword("");
    navigation.navigate("Home");
  };

  // Fetch settings and validate on mount or password change
  useEffect(() => {
    const initializeSettings = async () => {
      const settings = await getSettings("clave");
      setPasswordSettings(settings);
    };
    initializeSettings();
  }, []);

  useEffect(() => {
    if (passwordSettings.length > 0) {
      setValidationResults(validatePassword(password));
    }
  }, [password]);

  const rules = generateValidationRules(password);
  const results = rules.map((rule) => ({
    id: rule.id,
    description: rule.description,
    isValid: rule.validation(),
  }));
  const mandatoryChangePassword = user?.original?.CambiarClave;

  const filteredResults = results.filter((item) => item.description);

  return (
    <ScrollView>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Cuenta de Usuario:" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text>Actualice su contraseña:</Text>

        {/* Password Input */}
        <TextInput
          label="New Password"
          value={password}
          mode="outlined"
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
        />
        <HelperText
          type="error"
          visible={!validationResults.every((r) => r.isValid)}
        >
          Ensure your password meets all requirements.
        </HelperText>

        {/* Confirm Password Input */}
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          mode="outlined"
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          style={styles.input}
        />

        <Card style={{ marginTop: 16 }}>
          {/* Validation Checklist */}
          {filteredResults.map((result, index) => (
            <View key={index} style={styles.validationItem}>
              <IconButton
                size={10}
                icon={result.isValid ? "check" : "close"}
                color={result.isValid ? "green" : "red"}
              />
              <Text>{result.description}</Text>
            </View>
          ))}
        </Card>
        <Button
          mode="contained"
          style={{ marginTop: 40 }}
          onPress={handleChangePassword}
        >
          Actualizar Contraseña
        </Button>
        <Button
          mode="text"
          style={{ marginTop: 20 }}
          buttonColor={theme.colors.secondary}
          onPress={() => navigation.navigate("Home")}
        >
          Volver al Inicio
        </Button>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 36,
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 3,
  },
  input: {
    marginBottom: 16,
  },
  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
});
