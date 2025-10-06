import { Button, Text, TextInput, useTheme } from "react-native-paper";

import React, { useMemo, useRef, useState } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { Keyboard, StyleSheet, View } from "react-native";
import { useRoadmap } from "@/context/roadmap";
import { useKeyboardListener } from "@/hooks/useKeyboardListener";
import { useNotifications } from "@/context/notification";
import { useLoading } from "@/context/loading.utils";
import { useNavigation } from "@react-navigation/native";
import { useExpoSQLiteOperations } from "@/hooks/useExpoSQLiteOperations";

type OrderMenuProps = {
  closeSheet: () => void;
  selectedOrder: any;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
};

export default function OrderInvalidateSheet({
  closeSheet,
  selectedOrder,
  bottomSheetRef,
}: OrderMenuProps) {
  const theme = useTheme();
  const navigator = useNavigation();
  const { refresh, roadmap } = useRoadmap();
  const { showSnackbar } = useNotifications();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState(false);
  const [motivo, setMotivo] = useState("");
  const { keyboardVisible } = useKeyboardListener();

  const { markOrderAsInvalidated } = useExpoSQLiteOperations();
  const snapPoints = useMemo(
    () => [keyboardVisible ? "75%" : "40%"],
    [keyboardVisible]
  );

  const handleClose = () => {
    setError(false);
    setMotivo("");
    closeSheet();
  };

  const handleSubmit = async () => {
    try {
      if (!motivo) {
        setError(true);
        showSnackbar("Observaciones es requerido", "error");
        return;
      }
      setLoading(true);
      await markOrderAsInvalidated(roadmap.Id, {
        motivo,
        id: selectedOrder.Id,
      });
      const resp = await refresh();

      handleClose();

      showSnackbar("Solicitud de anulación enviada exitosamente.", "success");

      if (resp?.orders && resp?.orders?.length === 0) {
        navigator.reset({
          index: 0,
          routes: [{ name: "CloseRoadmap", params: { id: roadmap.Numero } }],
        });
      } else {
        navigator.reset({
          index: 0,
          routes: [{ name: "OnGoingOrders", params: { id: roadmap.Id } }],
        });
      }
    } catch (error) {
      setLoading(false);
      showSnackbar(
        "Error al enviar la solicitud de anulación, intente nuevamente.",
        "error"
      );
    }
  };

  const handleChange = (v) => {
    setError(false);
    setMotivo(v);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: "rgba(46, 64, 82, 1)" }}
        style={{ color: theme.colors.onSurface }}
        handleIndicatorStyle={{ backgroundColor: "white" }}
        enablePanDownToClose
        enableDismissOnClose
        onDismiss={handleClose}
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
              Anular Pedido: {selectedOrder?.Numero}
            </Text>
            <Text style={{ margin: 16 }}>¿Desea anular el Pedido?</Text>
            <TextInput
              label="Observaciones"
              mode="outlined"
              multiline
              value={motivo}
              onChangeText={handleChange}
              numberOfLines={5}
              style={{ margin: 16, marginTop: 0, height: 100 }}
              error={error}
            />
          </View>
          <View style={styles.card}>
            <Button
              icon="close"
              mode="outlined"
              disabled={isLoading}
              textColor="white"
              onPress={handleClose}
            >
              Cancelar
            </Button>
            <Button
              icon="send"
              disabled={isLoading}
              style={{ marginLeft: 16 }}
              mode="contained"
              onPress={handleSubmit}
            >
              Enviar
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </TouchableWithoutFeedback>
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

  truck: {
    width: 400,
    height: 200,
    alignSelf: "center",
    resizeMode: "contain",
  },
  cards: {},
  card: {
    padding: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
