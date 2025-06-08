import DisplayList from "@/components/DisplayList";
import NewPaymentSheet from "@/components/NewPaymentSheet/NewPaymentSheet";
import RemovePaymentSheet from "@/components/RemovePaymentSheet/RemovePaymentSheet";
import { ReusableTable } from "@/components/Table";
import { useLoading } from "@/context/loading.utils";
import { useNotifications } from "@/context/notification";
import { useRoadmap } from "@/context/roadmap";
import { formatMoney } from "@/utils/money";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Button, Text, TextInput } from "react-native-paper";

const columns = [
  { key: "MetodoDePago", title: "Método" },
  { key: "Monto", title: "Monto" },
  { key: "Comprobante", title: "Referencia" },
];

export function CashPayments() {
  const { order, roadmap, refresh, payments } =
    useRoadmap();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState({});

  const [comments, setComments] = useState("");
  const navigator = useNavigation();

  const montoCancelado = payments.reduce((acc, curr) => {
    if (curr.Monto) {
      acc += Number(curr.Monto) ?? 0;
    }
    return acc;
  }, 0);

  const { showSnackbar } = useNotifications();

  const montoPendiente = order?.Monto - montoCancelado;

  const tableData = payments.map((item) => {
    return {
      ...item,
      Monto: formatMoney(item.Monto),
      MetodoDePago: item?.MetodoPago?.Descripcion ?? "-",
      Comprobante: item.Comprobante ?? "-",
    };
  });

  const data = [
    {
      label: "Monto de la factura",
      value: order?.Monto ? formatMoney(order?.Monto) : "-",
    },
    {
      label: "Monto pendiente",
      value: formatMoney(montoPendiente),
    },
  ];

  const handleSave = async () => {
    if (montoPendiente !== 0) {
      showSnackbar("El monto pendiente debe ser igual a 0.", "error");
      return;
    }
    if (!comments) {
      showSnackbar("El campo Observaciones es requerido.", "error");
      setError(true);
      return;
    }
    try {
      await refresh();
      navigator.reset({
        index: 0,
        routes: [{ name: "CloseRoadmap", params: { id: roadmap.id } }],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const bottomSheetAddPaymentRef = useRef<BottomSheetModal>(null);
  const openAddSheet = useCallback(() => {
    bottomSheetAddPaymentRef.current?.present();
  }, []);

  const closeAddSheet = useCallback(() => {
    bottomSheetAddPaymentRef.current?.dismiss();
  }, []);

  const bottomSheetRemoveRef = useRef<BottomSheetModal>(null);
  const openRemoveSheet = useCallback(() => {
    bottomSheetRemoveRef.current?.present();
  }, []);

  const closeRemoveSheet = useCallback(() => {
    bottomSheetRemoveRef.current?.dismiss();
  }, []);

  const handleSelectTableItem = (v) => {
    setSelected(v);
    openRemoveSheet();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <DisplayList data={data} />

        <View style={styles.table}>
          <ReusableTable
            columns={columns}
            data={tableData}
            onSelect={handleSelectTableItem}
            keyExtractor={(item) => item.Id ?? item.Monto}
          />
        </View>

        <View
          style={{
            marginVertical: 20,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onPress={openAddSheet}
            mode="contained"
            style={{ width: 200 }}
            disabled={payments.length >= 4}
            icon="cash"
          >
            Agregar Pago
          </Button>
        </View>

        <View style={{ marginBottom: 40 }}>
          <Text variant="titleMedium">Observaciones</Text>
          <TextInput
            mode="outlined"
            label="Observaciones"
            value={comments}
            multiline
            numberOfLines={3}
            error={error}
            style={styles.textArea}
            onChangeText={setComments}
          />
        </View>
        <View>
          <Button
            onPress={handleSave}
            icon="send"
            mode="contained"
            disabled={isLoading}
            style={{ marginTop: 20, marginBottom: 50 }}
          >
            Guardar
          </Button>
          <NewPaymentSheet
            closeSheet={closeAddSheet}
            bottomSheetRef={bottomSheetAddPaymentRef}
          />
          <RemovePaymentSheet
            closeSheet={closeRemoveSheet}
            payment={selected}
            bottomSheetRef={bottomSheetRemoveRef}
          />
        </View>
      </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 50,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 180,
  },
  headerContainer: {
    paddingTop: 16,
  },
  cards: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
  },
  card: {
    padding: 15,
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  table: {
    flex: 1,
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,

    marginTop: 20,
  },
  textArea: {
    marginHorizontal: 0,
    flex: 1,
    marginTop: 10,
    height: 100,
  },
});
