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
  { key: "name", title: "Método" },
  { key: "age", title: "Monto" },
  { key: "email", title: "Referencia" },
];

export function CreditPayments() {
  const { order, refresh, payments, roadmap } = useRoadmap();
  const { setLoading, isLoading } = useLoading();
  const [error, setError] = useState(false);
  const { user } = useAuth();
  const [comments, setComments] = useState("");
  const navigator = useNavigation();
  const { showSnackbar } = useNotifications();

  const data = [
    {
      label: "Monto de la factura",
      value: order?.Monto ? formatMoney(order?.Monto) : "-",
    },
    {
      label: "Monto pendiente",
      value: formatMoney(0),
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

      if (comments.length > 100) {
        showSnackbar(
          "El campo Observaciones no puede exceder los 100 caracteres.",
          "error"
        );
        setError(true);
        return;
      }

      if (order?.Devoluciones?.length > 0) {
        showSnackbar(
          "No se puede registrar el pago porque existen devoluciones pendientes asociadas a este pedido. Por favor, finalice las devoluciones antes de continuar.",
          "error"
        );
        return;
      }
      setLoading(true);
      const payload = {
        ...(currentPayment ?? {}),
        pedidoId: order?.Id,
        monto: order?.Monto ? order.Monto : 0.001,
        observaciones: comments,
        usuario: user.username,
        metodoPago: {
          id: 10,
          descripcion: "Otros Métodos",
        },
      };

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
            showSnackbar(
        error?.response?.data?.errors?.Messages?.[0] ||
          "Error al agregar pago, intente nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={150}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingVertical: 16 }}
      >
        <DisplayList data={data} />
        <View style={styles.table}>
          <ReusableTable
            columns={columns}
            data={[]}
            keyExtractor={(item) => item.id}
          />
        </View>
        <View
          style={{
            marginVertical: 20,
            flex: 1,
            justifyContent: "flex-end",
            flexDirection: "row",
          }}
        >
          <Button
            mode="contained"
            disabled
            style={{ width: 200 }}
            icon={"cash"}
          >
            Agregar Pago
          </Button>
        </View>
        <View>
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
            style={{ marginTop: 20 }}
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
