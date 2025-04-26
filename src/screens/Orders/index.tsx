import React, { useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { getRoadmapById } from "@/api/roadmap";
import { useAuth } from "@/context/auth";
import { getOrdersByDate, getOrdersList } from "@/api/orders";
import OrderCard from "@/components/OrderCard/OrderCard";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import OrderSheet from "@/components/OrderMenu";
import { dayCR } from "@/utils/dates";
import { useLoading } from "@/context/loading.utils";

const Spacer = ({ size = 8, horizontal = false }) => (
  <View style={{ [horizontal ? "width" : "height"]: size }} />
);

function Orders({ id }: { id: string }) {
  const navigator = useNavigation();
  const theme = useTheme();
  const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();

  const [orders, setOrders] = React.useState([]);
  const [roadmap, setRoadmap] = React.useState(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getRoadmapById(id);
      setRoadmap(response);
      const orders = await getOrdersList({ hojaRutaId: response?.Id });
      setOrders(orders);
    } catch (error) {
      showSnackbar(
        "Error al carga la hoja de ruta, por favor intente nuevamente",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(value);

  const initialize = useCallback(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  useFocusEffect(initialize);

  const handleClick = (order) => {
    setSelectedOrder(order);
    openSheet();
  };
  return (
    <ProtectedRoute>
      <ScrollView>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              navigator.goBack();
            }}
          />
          <Appbar.Content
            title={
              <View>
                <Text variant="titleMedium">Hoja de Ruta:</Text>
                <Text>{id}</Text>
              </View>
            }
          />
          <Appbar.Action
            icon="send"
            onPress={() => {
              showSnackbar(
                "Para continuar, asegúrate de que todos los pedidos estén marcados.",
                "error"
              );
            }}
          />
        </Appbar.Header>
        <View style={styles.container}>
          <Text variant="titleMedium">
            {orders.length > 0 ? orders?.length : ""} Pedido(s):
          </Text>
          <Spacer size={16} />
          <View style={styles.cards}>
            {orders.map((order) => (
              <OrderCard
                onClick={handleClick}
                key={order.Numero}
                order={order}
                color="rgb(18, 86, 107)"
              />
            ))}
          </View>
        </View>
        <OrderSheet
          roadmap={roadmap}
          closeSheet={closeSheet}
          selectedOrder={selectedOrder}
          bottomSheetRef={bottomSheetRef}
        />
      </ScrollView>
    </ProtectedRoute>
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
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default Orders;
