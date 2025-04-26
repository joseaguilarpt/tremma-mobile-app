import { Button, Text, TextInput, useTheme } from "react-native-paper";

import React, { useMemo, useRef } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { StyleSheet, View } from "react-native";

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
  const snapPoints = useMemo(() => ["40%"], []);

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
            Anular Pedido: {selectedOrder?.Numero}
          </Text>
          <Text style={{ margin: 16 }}>¿Desea anular el Pedido?</Text>
          <TextInput
            label="Observaciones"
            mode="outlined"
            multiline
            numberOfLines={5}
            style={{ margin: 16, marginTop: 0, height: 100 }}
          />
        </View>
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
            onPress={closeSheet}
          >
            Enviar
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
