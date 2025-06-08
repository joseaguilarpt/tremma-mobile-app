import { postPayment, putPaymentById } from "@/api/payments";
import DisplayList from "@/components/DisplayList";
import { ReusableTable } from "@/components/Table";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading.utils";
import { useNotifications } from "@/context/notification";
import { useRoadmap } from "@/context/roadmap";
import { formatMoney } from "@/utils/money";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
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
  { key: "Referencia", title: "Referencia" },
];

export function CashPayments({
  payments = [],
  addPayment,
  onSelectTableItem,
}: {
  payments: any[];
  addPayment: () => void;
  onSelectTableItem: (o: string) => void;
}) {
  const { order, roadmap, refresh, paymentMethods } = useRoadmap();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState(false);
  const { user } = useAuth();
  const [comments, setComments] = useState("");
  const navigator = useNavigation();
  const { showSnackbar } = useNotifications();

  const montoCancelado = payments.reduce((acc, curr) => {
    if (curr.MontoCancelado) {
      acc += Number(curr.MontoCancelado) ?? 0;
    }
    return acc;
  }, 0);

  const montoPendiente = order?.Monto - montoCancelado;

  const tableData = payments.map((item) => {
    const pm = paymentMethods.find((v) => item.MetodoDePago === v.Id);
    return {
      ...item,
      Monto: formatMoney(item.MontoCancelado),
      MetodoDePago: pm?.Descripcion ?? "-",
      Referencia: item.Referencia ?? "-",
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
    const currentPayment = payments.find((item) => item.pedidoId === order.Id);
    try {
      if (!comments) {
        showSnackbar("Observaciones es requerido.", "error");
        setError(true);
        return;
      }

      setLoading(true);
      const payload = {
        ...(currentPayment ?? {}),
        pedidoId: order?.Id,
        monto: order?.Monto,
        observaciones: comments,
        usuario: user.username,
      };

      if (order?.CondicionPago) {
        payload.metodoPago = {
          id: order?.CondicionPago?.Id,
          descripcion: order?.CondicionPago?.Descripcion,
        };
      }

      let api = postPayment;
      if (currentPayment) {
        api = putPaymentById;
      }

      await api(payload);
      showSnackbar("Pago actualizado exitosamente.", "success");
      await refresh();
      navigator.reset({
        index: 0,
        routes: [{ name: "OnGoingOrders", params: { id: roadmap.id } }],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  console.log(payments, "payments");
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
            data={payments}
            onSelect={onSelectTableItem}
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
            onPress={addPayment}
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
