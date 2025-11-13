import React, { useCallback, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Appbar,
  Badge,
  Button,
  Icon,
  Text,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import OrderInvalidateSheet from "@/components/OrderInvalidate";
import { useRoadmap } from "@/context/roadmap";
import { useLoading } from "@/context/loading.utils";
import { useExpoSQLiteOperations } from "@/hooks/useExpoSQLiteOperations";

function ReturnDetailsScreen() {
  const route = useRoute();
  const params = route.params as { [key: string]: string | number };
  const { setLoading }= useLoading();
  const { getReturnById, closeReturn } = useExpoSQLiteOperations()
  const { refresh, roadmap, orders, order } = useRoadmap();
  const { showSnackbar } = useNotifications();
  const [formState, setFormState] = React.useState({
    Productos: "",
    Observaciones: "",
  });


  const getReturn = async () => {
    try {
      setLoading(true);
      const returnData = await getReturnById(params.ReturnId ?? params.id as string);
      const currentOrder = orders?.find((item) => String(item.Id) === String(params.PedidoId));
        let payload = {...returnData };
      if (currentOrder?.Devoluciones?.length > 0) {
        const currentReturn = currentOrder.Devoluciones.find(
          (item) => String(item.Id) === String(params.id)
        );
        if (currentReturn) {
          payload = {
            ...payload,
            ...currentReturn,
            Productos: returnData?.Productos
          };
        }
      }
      setFormState(payload);
    } catch (error) {
      console.error("Error getting return:", error);
      showSnackbar(
        "Error al cargar la devolución, intente nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleParams = useCallback(() => {
    getReturn();
  }, [params]);

  useFocusEffect(handleParams);

  const navigator = useNavigation();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { messages } = useNotifications();

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleInputChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const data = [
    {
      label: "Número de pedido relacionado",
      value: formState?.Numero ?? "-",
    },
    {
      label: "Nombre del cliente",
      value: formState?.NombreCliente ?? "-",
    },
  ];

  const handleSave = async () => {
    try {
      if (!formState.Observaciones) {
        showSnackbar("Por favor, ingrese las observaciones.", "error");
        return;
      }
      if (formState.Observaciones.length > 100) {
        showSnackbar(
          "Las observaciones no pueden exceder los 100 caracteres.",
          "error"
        );
        return;
      }
      const payload = {
        ...formState,
        id: formState?.Id || formState?.id,
        descripcion: formState.Observaciones,
      };
      await closeReturn(formState?.ReturnId ?? formState?.id ?? formState?.Id, formState.Observaciones);
      await refresh();
      showSnackbar("Devolución actualizada exitosamente.", "success");

      navigator.navigate("OnGoingOrders", {
        id: roadmap.Id,
      });
    } catch (error) {
      showSnackbar(error?.response?.data?.errors?.Messages?.[0] || error?.message || "Error al actualizar la devolución.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <View style={styles.screenContainer}>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              navigator.goBack();
            }}
          />
          <Appbar.Content
            title={
              <View>
                <Text variant="titleMedium">Detalle de la Devolución:</Text>
                <Text>{order?.PedidoId || formState?.NumeroPedido}</Text>
              </View>
            }
          />
          <Appbar.Action
            onPress={handleSave}
            icon={({ size, color }) => (
              <TouchableRipple>
                <View>
                  <Icon source="send" size={24} />
                </View>
              </TouchableRipple>
            )}
          />
          <Appbar.Action
            onPress={() => navigator.navigate("Messages")}
            icon={({ size, color }) => (
              <TouchableRipple>
                <View>
                  <Icon source="message" size={24} />
                  {(messages ?? []).length > 0 && (
                    <Badge style={{ position: "absolute", top: -5, right: -5 }}>
                      {messages.length}
                    </Badge>
                  )}
                </View>
              </TouchableRipple>
            )}
          />
        </Appbar.Header>

        <ScrollView style={styles.container}>
          <Text variant="titleMedium">Detalles:</Text>
          <View style={styles.cards}>
            {data.map((item, index) => (
              <React.Fragment key={index}>
                <View style={styles.card}>
                  <Text variant="titleMedium">{item.label}:</Text>
                </View>
                <View style={styles.card}>
                  <Text>{item.value ?? "-"}</Text>
                </View>
              </React.Fragment>
            ))}

            <View style={{ flex: 1, padding: 15, marginBottom: 20 }}>
              <Text variant="titleMedium">Productos:</Text>

              <TextInput
                mode="outlined"
                label="Productos"
                disabled
                value={formState.Productos}
                style={{ marginTop: 10 }}
                onChangeText={(value) => handleInputChange("Productos", value)}
              />
              <Text style={{ marginTop: 20 }} variant="titleMedium">
                Observaciones:
              </Text>

              <TextInput
                mode="outlined"
                label="Observaciones"
                value={formState.Observaciones}
                multiline
                numberOfLines={3}
                style={styles.textArea}
                onChangeText={(value) =>
                  handleInputChange("Observaciones", value)
                }
              />
            </View>
          </View>
          <View>
            <Button
              onPress={handleSave}
              icon="send"
              mode="contained"
              style={{ marginTop: 20 }}
            >
              Recibida
            </Button>
          </View>
        </ScrollView>
        <OrderInvalidateSheet
          closeSheet={closeSheet}
          selectedOrder={order}
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    </ProtectedRoute>
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
  textArea: {
    marginHorizontal: 0,
    flex: 1,
    marginTop: 10,
    height: 100,
  },
});

export default ReturnDetailsScreen;
