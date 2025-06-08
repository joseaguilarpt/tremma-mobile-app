import { Button, Menu, Text, TextInput, useTheme } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import React, { useMemo, useRef, useState } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";
import { useNotifications } from "@/context/notification";
import { useRoadmap } from "@/context/roadmap";

type OrderMenuProps = {
  closeSheet: () => void;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
};

export default function NewPaymentSheet({
  closeSheet,
  bottomSheetRef,
  onSave,
}: OrderMenuProps) {
  const theme = useTheme();
  const { paymentMethods } = useRoadmap()
  const snapPoints = useMemo(() => ["70%"], []);
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState({});
  const { showSnackbar } = useNotifications();

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
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
    }
  };

  const currentMethod = paymentMethods.find(
    (item) => item.Id === formState?.MetodoDePago
  );

  const clearForm = () => {
    setOpen(false);
    closeSheet();
    setFormState({});
    setErrors({});
  };

  const handleSave = () => {
    let err = {};
    if (!formState.MetodoDePago) {
      err.MetodoDePago = "MetodoDePago";
    }
    if (!formState.MontoCancelado) {
      err.MontoCancelado = "MontoCancelado";
    }
    if (err.MontoCancelado || err.MetodoDePago) {
      setErrors(err);
      showSnackbar("Por favor complete los campos requeridos.", "error");
      return;
    }
    clearForm();
    onSave(formState);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      backgroundStyle={{ backgroundColor: "rgba(46, 64, 82, 1)" }}
      style={{ color: theme.colors.onSurface }}
      handleIndicatorStyle={{ backgroundColor: "white" }}
      enablePanDownToClose
      enableDismissOnClose
      onDismiss={closeSheet}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.drawer}>
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onSurface, padding: 16 }}
          >
            Registrar Pago:
          </Text>
          <Menu
            visible={open}
            onDismiss={() => setOpen(false)}
            anchor={
              <Button
                icon={"arrow-down"}
                style={{
                  marginHorizontal: 16,
                  marginTop: 0,
                  marginBottom: 12,
                  padding: 4,
                  backgroundColor: !!errors.MetodoDePago
                    ? "rgb(131, 44, 44)"
                    : "rgb(31, 34, 58)",
                  borderRadius: 5,
                  borderColor: !!errors.MetodoDePago
                    ? "rgb(131, 44, 44)"
                    : "rgb(255, 255, 255)",
                }}
                contentStyle={{
                  flexDirection: "row-reverse",
                }}
                textColor="white"
                mode="outlined"
                onPress={() => setOpen(true)}
              >
                <Text>
                  {formState?.MetodoDePago
                    ? currentMethod?.Descripcion
                    : "*  Metodo de Pago..."}
                </Text>
              </Button>
            }
          >
            {paymentMethods.map((item) => (
              <Menu.Item
                key={item.Id}
                onPress={() => {
                  setFormState((prev) => ({
                    ...prev,
                    MetodoDePago: item.Id,
                  }));
                  setOpen(false);
                }}
                title={item.Descripcion}
              />
            ))}
          </Menu>
          <TextInput
            label="Monto Cancelado *"
            mode="outlined"
            error={!!errors.MontoCancelado}
            keyboardType="numeric"
            value={formState?.MontoCancelado ?? ""}
            onChangeText={(text) => {
              setFormState((prev) => ({
                ...prev,
                MontoCancelado: text,
              }));
            }}
            style={{ margin: 16, marginTop: 0 }}
          />
          <TextInput
            label="Referencia Comprobante"
            mode="outlined"
            value={formState?.Referencia ?? ""}
            onChangeText={(text) => {
              setFormState((prev) => ({
                ...prev,
                Referencia: text,
              }));
            }}
            style={{ margin: 16, marginTop: 0 }}
          />
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
        <View style={styles.card}>
          <Button
            icon="close"
            mode="outlined"
            textColor="white"
            onPress={clearForm}
          >
            Cancelar
          </Button>
          <Button
            icon="send"
            style={{ marginLeft: 16 }}
            mode="contained"
            onPress={handleSave}
          >
            Guardar
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: "100%",
  },
  container: {
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingTop: 16, // Evita solapamiento con la StatusBar en Android
  },
  divider: {
    margin: 12,
    borderColor: "white",
    borderBottomWidth: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    // backgroundColor: "rgba(46, 64, 82, 0.8)",
  },

  cards: {},
  card: {
    padding: 20,
    marginTop: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
