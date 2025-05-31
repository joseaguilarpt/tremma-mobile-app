import React, { useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  CommonActions,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation, useTheme } from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import OnGoingOrders from "../OnGoingOrders";
import OnGoingRoadmap from "../OnGoingRoadmap";
import { getCurrentRoadmap, putMoveOrdersInSameRoadmap } from "@/api/orders";
import { useLoading } from "@/context/loading.utils";
import { useAuth } from "@/context/auth";
import OrdersMap from "@/components/Map/Map";
import { Order } from "@/types/Roadmap";

const Tab = createBottomTabNavigator();

export default function OnGoingScreen() {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as { id: string };

  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();
  const { user } = useAuth();

  const [orders, setOrders] = React.useState([]);
  const [roadmap, setRoadmap] = React.useState(null);
  const [isOpenMap, setIsOpenMap] = React.useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCurrentRoadmap();
      setRoadmap(response);
      const ordersWithReturns = [];
      (response?.Pedidos ?? []).forEach((item) => {
        const newOrder = { ...item, key: item.Id };
        ordersWithReturns.push(newOrder);
      });
      setOrders(ordersWithReturns);
    } catch (error) {
      showSnackbar(
        "Error al carga la hoja de ruta, por favor intente nuevamente",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const initialize = useCallback(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  useFocusEffect(initialize);

  const handleReorderData = async ({
    data,
    from,
    to,
  }: {
    data: Order[];
    from: number;
    to: number;
  }) => {
    const current = orders[from] as Order;
    const newSequence = orders[to] as Order;
    const Secuencia =
      from < to ? newSequence.Secuencia + 1 : newSequence.Secuencia;
    setOrders(data);
    setLoading(true);
    try {
      await putMoveOrdersInSameRoadmap({
        hojaRutaId: roadmap?.Id,
        pedidoId: current.Id,
        secuencia: Secuencia ?? 1,
      });
      await fetchData();
      showSnackbar(`Los pedidos fueron movidos exitosamente.`, "success");
    } catch (error) {
      showSnackbar("Error al mover los pedidos, intentelo nuevamente", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          id={undefined}
          screenOptions={{
            headerShown: false,
          }}
          tabBar={({ navigation, state, descriptors, insets }) => (
            <BottomNavigation.Bar
              navigationState={state}
              safeAreaInsets={insets}
              style={{
                backgroundColor: theme.colors.surface,
                marginHorizontal: -40,
              }}
              inactiveColor={theme.colors.secondary}
              activeColor={theme.colors.onPrimary}
              onTabPress={({ route, preventDefault }) => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (event.defaultPrevented) {
                  preventDefault();
                } else {
                  navigation.dispatch({
                    ...CommonActions.navigate(route.name, route.params),
                    target: state.key,
                  });
                }
              }}
              renderIcon={({ route, focused, color }) => {
                const { options } = descriptors[route.key];
                if (options.tabBarIcon) {
                  return options.tabBarIcon({ focused, color, size: 24 });
                }
                return null;
              }}
              getLabelText={({ route }) => {
                const { options } = descriptors[route.key];
                return options.tabBarLabel ?? options.title;
              }}
            />
          )}
        >
          <Tab.Screen
            name="DetallePedidos"
            options={{
              tabBarLabel: "Pedidos",
              tabBarIcon: ({ color, size }) => {
                return <Icon name="list" size={size} color={color} />;
              },
            }}
          >
            {() => (
              <OnGoingOrders
                onOrdersChange={(v, d) =>
                  handleReorderData({ from: d.from, to: d.to, data: v })
                }
                id={params.id}
                roadmap={roadmap}
                orders={orders}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="DetalleHoja"
            options={{
              tabBarLabel: "Detalles Hoja de Ruta",
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                return <Icon name="home" size={size} color={color} />;
              },
            }}
          >
            {() => (
              <OnGoingRoadmap
                id={params.id}
                roadmap={roadmap}
                orders={orders}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
        <TouchableOpacity
          onPress={() => setIsOpenMap(true)}
          style={[
            styles.floatingButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Icon name="map" size={30} color="white" />
        </TouchableOpacity>
        <OrdersMap
          orders={orders}
          isOpen={isOpenMap}
          closeModal={() => setIsOpenMap(false)}
        />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    alignSelf: "center",
    bottom: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
});
