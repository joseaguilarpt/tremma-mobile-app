import { Button, Text, useTheme } from "react-native-paper";
import React, { useMemo } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";
import { formatMoney } from "@/utils/money";
import { deletePaymentById } from "@/api/payments";
import { useNotifications } from "@/context/notification";
import { useLoading } from "@/context/loading.utils";
import { useRoadmap } from "@/context/roadmap";

type OrderMenuProps = {
  closeSheet: () => void;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
};

export default function RemovePaymentSheet({
  closeSheet,
  bottomSheetRef,
  payment,
}: OrderMenuProps) {
  const theme = useTheme();
  const snapPoints = useMemo(() => ["30%"], []);
  const { showSnackbar } = useNotifications();
  const { setLoading, isLoading } = useLoading();
  const { refresh, fetchPayments } = useRoadmap();

  const handleRemove = async () => {
    try {
      setLoading(true);

      await deletePaymentById({ id: payment.Id });
      showSnackbar("Pago eliminado exitosamente.", "success");
      await refresh();
      await fetchPayments(payment.PedidoId);
      closeSheet();
    } catch (error) {
      console.log(error, "error");
      showSnackbar("Error al eliminar pago, intente nuevamente.", "error");
    } finally {
      setLoading(false);
    }
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
            Remover Pago:
          </Text>
          <Text style={{ margin: 16 }}>
            ¿Desea remover el pago por{" "}
            {payment?.Monto
              ? formatMoney(payment?.Monto)
              : "-"}{" "}
            de la lista?
          </Text>

          <View style={styles.card}>
            <Button
              icon="close"
              mode="outlined"
              textColor="white"
              onPress={closeSheet}
            >
              Cancelar
            </Button>
            <Button
              icon="send"
              style={{ marginLeft: 16 }}
              mode="contained"
              onPress={handleRemove}
              disabled={isLoading}
            >
              Remover
            </Button>
          </View>
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
  },

  cards: {},
  card: {
    padding: 20,
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
