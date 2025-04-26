import {
  Divider,
  Icon,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";

import React, { useCallback, useMemo, useRef } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";
import OrderInvalidateSheet from "../OrderInvalidate";
import OrderNotLoadedSheet from "../OrderNotLoaded";
import { confirmOrderAssignment } from "@/api/orders";
import { useNotifications } from "@/context/notification";
import { useLoading } from "@/context/loading.utils";

type OrderMenuProps = {
  closeSheet: () => void;
  selectedOrder: any;
  roadmap: any;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
};

export default function OrderSheet({
  closeSheet,
  selectedOrder,
  roadmap,
  bottomSheetRef,
}: OrderMenuProps) {
  const theme = useTheme();
  const { showSnackbar } = useNotifications();
  const { setLoading } = useLoading();
  const snapPoints = useMemo(() => ["40%"], []);
  const invalidateSheetRef = useRef<BottomSheetModal>(null);
  const notLoadedSheetRef = useRef<BottomSheetModal>(null);

  const openInvalidateSheet = useCallback(() => {
    invalidateSheetRef.current?.present();
  }, []);

  const closeInvalidateSheet = useCallback(() => {
    invalidateSheetRef.current?.dismiss();
  }, []);

  const openNotLoadedSheet = useCallback(() => {
    notLoadedSheetRef.current?.present();
  }, []);

  const closeNotLoadedSheet = useCallback(() => {
    notLoadedSheetRef.current?.dismiss();
  }, []);

  const handleAcceptAssignment = async () => {
    try {
      closeSheet();
      setLoading(true);
      const payload = {
        Id: roadmap.Id,
        orders: [selectedOrder.Id],
      };
      await confirmOrderAssignment(payload);
      showSnackbar("Pedido marcado como cargado exitosamente.", "success");
    } catch (error) {
      console.log(error);
      showSnackbar(
        error?.response?.data?.errors?.Messages?.[0] ||
          "Error al Marcar como Cargado.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              Pedido: {selectedOrder?.Numero}
            </Text>
            <TouchableRipple
              onPress={handleAcceptAssignment}
              rippleColor="rgb(67, 170, 177)"
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <>
                <Icon source="check" size={26} color={theme.colors.onSurface} />
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface, paddingLeft: 16 }}
                >
                  Marcar como Cargado
                </Text>
              </>
            </TouchableRipple>
            <Divider style={styles.divider} />
            <TouchableRipple
              onPress={() => {
                openNotLoadedSheet();
                closeSheet();
              }}
              rippleColor="rgb(67, 170, 177)"
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <>
                <Icon source="close" size={26} color={theme.colors.onSurface} />
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface, paddingLeft: 16 }}
                >
                  Marcar como No Cargado
                </Text>
              </>
            </TouchableRipple>
            <Divider style={styles.divider} />

            <TouchableRipple
              onPress={() => {
                openInvalidateSheet();
                closeSheet();
              }}
              rippleColor="rgb(67, 170, 177)"
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <>
                <Icon
                  source="cancel"
                  size={26}
                  color={theme.colors.onSurface}
                />
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurface, paddingLeft: 16 }}
                >
                  Solicitud de Anulación
                </Text>
              </>
            </TouchableRipple>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <OrderInvalidateSheet
        closeSheet={closeInvalidateSheet}
        bottomSheetRef={invalidateSheetRef}
        selectedOrder={selectedOrder}
      />
      <OrderNotLoadedSheet
        closeSheet={closeNotLoadedSheet}
        bottomSheetRef={notLoadedSheetRef}
        selectedOrder={selectedOrder}
      />
    </>
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

  truck: {
    width: 400,
    height: 200,
    alignSelf: "center",
    resizeMode: "contain",
  },
  cards: {},
  card: {
    padding: 20,
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
