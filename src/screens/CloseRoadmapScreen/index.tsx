import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { Appbar, Button, Text, TextInput } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import * as DocumentPicker from "expo-document-picker";
import { useLoading } from "@/context/loading.utils";
import DisplayList from "@/components/DisplayList";
import { formatMoney } from "@/utils/money";
import { useRoadmap } from "@/context/roadmap";
import { postFile } from "@/api/files";
import { finishRoadmap } from "@/api/orders";
import { getTotalPaymentByRoadmap } from "@/api/payments";
import { getReportPDF } from "@/api/report";
import { useAuth } from "@/context/auth";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useExpoSQLiteOperations } from "@/hooks/useExpoSQLiteOperations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import expoSQLiteService from "@/database/expoSQLiteService";

type Nullable<T> = T | null;

function filterNullValues<T extends object>(obj: Nullable<T>): T {
  // Check if the value is an object and not an array
  const isObject = (value: any) =>
    value && typeof value === "object" && !Array.isArray(value);

  // Use Object.entries to loop through key-value pairs
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null) {
      // If the value is an object, recursively filter it
      (acc as any)[key] = isObject(value) ? filterNullValues(value) : value;
    }
    return acc;
  }, {} as T);
}

function CloseRoadmap({ id }: { id: string }) {
  const navigator = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const params = route.params as { [key: string]: string | number };
  const { setLoading, isLoading } = useLoading();
  const { roadmap, refresh, getCashPayments, efectivo } = useRoadmap();
  const [errors, setErrors] = React.useState<{[key: string]: string | null}>({});
  const { showSnackbar } = useNotifications();
  const { recreateTables } = useExpoSQLiteOperations();
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);
  const [formState, setFormState] = React.useState<{
    Efectivo: string;
    Observaciones: string;
    Referencia: string;
    Comprobante?: any;
    ComprobanteLocal?: boolean;
  }>({
    Efectivo: "",
    Observaciones: "",
    Referencia: "",
    ComprobanteLocal: false,
  });

  const getPaymentsData = () => {
    getCashPayments()
    getLocal();
  }

  useEffect(() => {
    if (efectivo) {
      setFormState((prev) => ({ ...prev, Efectivo: efectivo }));
    }
  }, [efectivo]);

  useEffect(() => {
    if (!isOffline) {
      refresh()
      getPaymentsData()
    }
  }, [isOffline])

  useEffect(() => {
    getPaymentsData()
  }, []);

  const data = [
    {
      label: "Valores a crédito",
      value: roadmap?.TotalCredito
        ? formatMoney(roadmap.TotalCredito)
        : formatMoney(0),
    },
    {
      label: "Valores de contado",
      value: roadmap?.TotalContado
        ? formatMoney(roadmap.TotalContado)
        : formatMoney(0),
    },
    {
      label: "Valor total",
      value: roadmap?.TotalMonto
        ? formatMoney(roadmap.TotalMonto)
        : formatMoney(0),
    },
  ];

  const handleInputChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      const report = await getReportPDF("rptDetalleHojaRuta", [
        { item1: "usuario", item2: user?.username },
        { item1: "hojaRutaId", item2: roadmap?.Id },
      ]);

      const fileUri = FileSystem.cacheDirectory + "reporte.pdf";
      const base64Pdf = arrayBufferToBase64(report);

      // Guardar el string tal cual, como UTF-8 (no base64)
      await FileSystem.writeAsStringAsync(fileUri, base64Pdf, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert("Este dispositivo no soporta compartir archivos.");
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveLocal = async () => {
    const payload: any = { RoadmapId: roadmap?.Id, Efectivo: formState.Efectivo, Observaciones: formState.Observaciones, Referencia: formState.Referencia }
    if (formState.Comprobante && !formState.ComprobanteLocal) {
      const imageId = await expoSQLiteService.createImage({ ...formState.Comprobante, containerName: "comprobantesdata" });
      payload.Comprobante = imageId;
      payload.ComprobanteLocal = true
    }
    await AsyncStorage.setItem("closeRoadmapFormState", JSON.stringify(payload));
  }


  const getLocal = async () => {
    const payload = await AsyncStorage.getItem("closeRoadmapFormState");
    if (payload) {
      const data = JSON.parse(payload);
      if (data.Comprobante) {
        try {
          const image = await expoSQLiteService.getImageById(data.Comprobante);
          
          // Validate that image exists and has required data
          if (image && image.image_data && image.image_type && image.image_name) {
            // Additional validation: check if image_data looks like valid base64
            const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
            if (base64Regex.test(image.image_data)) {
              data.Comprobante = {
                "mimeType": image.image_type, 
                "name": image.image_name, 
                "size": image.image_size, 
                // image.image_data es un base64
                "uri": `data:${image.image_type};base64,${image.image_data}`
              }
            } else {
              console.warn("Image data is not valid base64:", image.image_data?.substring(0, 50) + "...");
              // Remove the comprobante if data is invalid
              delete data.Comprobante;
            }
          } else {
            console.warn("Image data is incomplete or missing:", image);
            // Remove the comprobante if data is invalid
            delete data.Comprobante;
          }
        } catch (error) {
          console.error("Error retrieving image from database:", error);
          // Remove the comprobante if there's an error
          delete data.Comprobante;
        }
      }
      setFormState(data);
    }
  }


  const handleSave = async () => {
    try {
      const { blockedOrders } = await refresh();
      if (isOffline) {
        await saveLocal()
        showSnackbar("No se puede ejectuar el cierre porque no estás conectado a internet.", "error");
        return;
      }
      if (!formState.Comprobante && Number(formState.Efectivo) > 0) {
        showSnackbar("Por favor adjunte un archivo comprobante.", "error");
        return;
      }
      let err: {[key: string]: string} = {};

      if (!formState.Observaciones) {
        err.Observaciones = "El campo Observaciones es requerido.";
      }

      if (!formState.Referencia && Number(formState.Efectivo) > 0) {
        err.Referencia = "El campo Comprobante es requerido.";
      }

      if (!formState.Comprobante && Number(formState.Efectivo) > 0) {
        err.Comprobante = "Por favor, adjunte un comprobante para continuar.";
      }

      if (Object.keys(err).length > 0) {
        setErrors(err);
        const errorMessages = Object.values(err).join(" ");
        showSnackbar(errorMessages, "error");
        return;
      }

      if (blockedOrders.length > 0) {
        showSnackbar(
          "No se puede ejectuar el cierre porque tiene pedidos en estado Bloqueado.",
          "error"
        );

        return;
      }

      setLoading(true);
      let imageId = "";
      if (formState.Comprobante) {
        imageId = await postFile(formState.Comprobante, "comprobantesdata");
      }


      const payload: any = filterNullValues({
        comprobante: formState?.Referencia ? formState?.Referencia : null,
        hojaRutaId: roadmap?.Id,
        observaciones: formState?.Observaciones
          ? formState?.Observaciones
          : null,
      });

      if (formState?.Efectivo) {
        payload.totalEfectivo = Number(formState?.Efectivo);
      }

      if (imageId) {
        payload.imagen = imageId;
      }
      await finishRoadmap(payload);
      showSnackbar("Hoja de Ruta cerrada exitosamente.", "success");
      await refresh();
      if (!isOffline) {
        await AsyncStorage.removeItem("loaded-orders")
        await AsyncStorage.removeItem("closeRoadmapFormState")
        await AsyncStorage.removeItem("active-roadmap")
        await recreateTables()
      }
      (navigator as any).navigate("Home");
    } catch (error) {
      await saveLocal()

      console.error("Error closing roadmap:", error);
      showSnackbar(
        error?.response?.data?.errors?.Messages?.[0] ||
        "Error al cerrar la hoja de Ruta, intente nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*", // Puedes restringir a 'application/pdf', 'image/*', etc.
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result?.assets && result.assets.length > 0) {
        setFormState((prev) => ({
          ...prev,
          Comprobante: result.assets[0],
        }));
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ProtectedRoute>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Appbar.Header>
              <Appbar.BackAction
                onPress={() => {
                  (navigator as any).navigate("Home");
                }}
              />
              <Appbar.Content
                title={
                  <View>
                    <Text variant="titleMedium">Cerrar Hoja de Ruta:</Text>
                    <Text>{roadmap?.Numero ?? "-"}</Text>
                  </View>
                }
              />
              {!isOffline && <Appbar.Action
                icon="file-export-outline"
                onPress={handleGeneratePDF}
              />}
              <Appbar.Action
                icon="send"
                onPress={handleSave}
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
                  error={!!errors.Observaciones}
                  onChangeText={(value) =>
                    handleInputChange("Observaciones", value)
                  }
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <Text variant="titleMedium">Efectivo</Text>

                <View
                  style={{
                    marginTop: 5,
                    borderWidth: 0.7,
                    borderColor: "#80808",
                    borderRadius: 4,
                    padding: 10,
                    backgroundColor: "rgb(14, 26, 41)",
                  }}
                >
                  <Text style={{ color: "#aaaaaa" }} variant="bodyLarge">
                    {formatMoney(Number(formState?.Efectivo) || 0)}
                  </Text>
                </View>
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
                      {Math.round(Number(formState.Comprobante.size) / 1024)} KB)
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    mode="outlined"
                    label={
                      Number(formState.Efectivo) > 0
                        ? "Referencia Comprobante *"
                        : "Referencia Comprobante"
                    }
                    value={formState?.Referencia}
                    error={!!errors.Referencia}
                    onChangeText={(value) =>
                      handleInputChange("Referencia", value)
                    }
                  />
                </View>
              </View>
              <View style={styles.card}>
                {!isOffline && <Button
                  icon="file-export-outline"
                  mode="outlined"
                  textColor="white"
                  disabled={isLoading}
                  onPress={handleGeneratePDF}
                >
                  Informe de Hoja
                </Button>}
                <Button
                  icon="send"
                  style={{ marginLeft: 16 }}
                  mode="contained"
                  disabled={isLoading}
                  onPress={handleSave}
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
