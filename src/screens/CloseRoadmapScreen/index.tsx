import React, { useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { getRoadmapById } from "@/api/roadmap";
import { useAuth } from "@/context/auth";
import * as DocumentPicker from "expo-document-picker";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLoading } from "@/context/loading.utils";
import DisplayList from "@/components/DisplayList";
import { formatMoney } from "@/utils/money";

function CloseRoadmap({ id }: { id: string }) {
  const navigator = useNavigation();
  const route = useRoute();
  const params = route.params as { [key: string]: string | number };

  const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();
  const [roadmap, setRoadmap] = React.useState(null);
  const [formState, setFormState] = React.useState({
    Producto: "",
    Observaciones: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getRoadmapById(params?.id);
      setRoadmap(response);
    } catch (error) {
      showSnackbar(
        "Error al carga la hoja de ruta, por favor intente nuevamente",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const initialize = useCallback(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  useFocusEffect(initialize);

  const data = [
    {
      label: "Valores a crédito",
      value: roadmap?.TotalCredito ? formatMoney(roadmap.TotalCredito) : "-",
    },
    {
      label: "Valores de contado",
      value: roadmap?.TotalContado ? formatMoney(roadmap.TotalContado) : "-",
    },
    {
      label: "Valor total",
      value: roadmap?.TotalMonto ? formatMoney(roadmap.TotalMonto) : "-",
    },
  ];

  const handleInputChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Puedes restringir a 'application/pdf', 'image/*', etc.
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result?.assets && result.assets.length > 0) {
        setFormState((prev) => ({
          ...prev,
          Comprobante: result.assets[0],
        }));
        console.log("Archivo seleccionado:", result.assets[0]);
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={"height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ProtectedRoute>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Appbar.Header>
              <Appbar.BackAction
                onPress={() => {
                  navigator.goBack();
                }}
              />
              <Appbar.Content
                title={
                  <View>
                    <Text variant="titleMedium">Cerrar Hoja de Ruta:</Text>
                    <Text>{params?.Numero ?? "-"}</Text>
                  </View>
                }
              />
              <Appbar.Action
                icon="file-export-outline"
                onPress={() => {
                  showSnackbar(
                    "Para continuar, asegúrate de que todos los pedidos estén marcados.",
                    "error"
                  );
                }}
              />
              <Appbar.Action
                icon="send"
                onPress={() => {
                  showSnackbar(
                    "Para continuar, asegúrate de que todos los pedidos estén marcados.",
                    "error"
                  );
                }}
              />
            </Appbar.Header>
            <View style={styles.container}>
              <View>
                <DisplayList data={data} />
              </View>
              <View style={{ marginTop: 20 }}>
                <Text variant="titleMedium">Observaciones</Text>
                <TextInput
                  mode="outlined"
                  label="Observaciones"
                  value={formState?.Observaciones}
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                  onChangeText={(value) =>
                    handleInputChange("Observaciones", value)
                  }
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <Text variant="titleMedium">Efectivo</Text>

                <TextInput
                  mode="outlined"
                  label="Efectivo"
                  value={formState?.Efectivo}
                  onChangeText={(value) => handleInputChange("Efectivo", value)}
                />
              </View>
              <View
                style={{
                  marginTop: 20,
                  flex: 1,
                  flexDirection: "row",
                  gap: 20,
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, maxWidth: 180 }}>
                  <Button icon={"upload"} onPress={handlePickDocument}>
                    Cargar Comprobante
                  </Button>
                  {formState.Comprobante && (
                    <Text style={{ margin: "auto" }}>
                      Archivo: {formState.Comprobante.name} (
                      {Math.round(formState.Comprobante.size! / 1024)} KB)
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label="Referencia Comprobante"
                    value={formState?.Efectivo}
                    keyboardType="numeric"
                    onChangeText={(value) =>
                      handleInputChange("Efectivo", value)
                    }
                  />
                </View>
              </View>
              <View style={styles.card}>
                <Button
                  icon="file-export-outline"
                  mode="outlined"
                  textColor="white"
                  //  onPress={clearForm}
                >
                  Informe de Hoja
                </Button>
                <Button
                  icon="send"
                  style={{ marginLeft: 16 }}
                  mode="contained"
                  //   onPress={handleSave}
                >
                  Cerrar Hoja
                </Button>
              </View>
            </View>
          </ScrollView>
        </ProtectedRoute>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  textArea: {
    marginHorizontal: 0,
    flex: 1,
    height: 100,
  },
  card: {
    marginTop: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});

export default CloseRoadmap;
