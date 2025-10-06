import React, { useCallback, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
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
import { useLoading } from "@/context/loading.utils";
import OrdersMap from "@/components/Map/Map";
import { Order } from "@/types/Roadmap";
import { useRoadmap } from "@/context/roadmap";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useExpoSQLiteOperations } from "@/hooks/useExpoSQLiteOperations";

const Tab = createBottomTabNavigator();

export default function OnGoingScreen() {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as { id: string };
  const navigator = useNavigation<any>();
  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();
  const { orders, roadmap, refresh, setOrders } = useRoadmap();
  const [isOpenMap, setIsOpenMap] = React.useState(false);

  const { moveOrdersInSameRoadmap } = useExpoSQLiteOperations();
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);
  const handleCheckOrders = useCallback(() => {
    if (orders.length === 0) {
      navigator.navigate("CloseRoadmap", {
        id: roadmap?.Id,
      });
    }
  }, []);

  useFocusEffect(handleCheckOrders);

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
      await moveOrdersInSameRoadmap(roadmap?.Id, {
        id: current.Id,
        secuencia: Secuencia ?? 1,
      });
      await refresh();
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
          {!isOffline && <Tab.Screen
            name="MapView"
            options={{
              tabBarLabel: "Ver Mapa",

              tabBarIcon: ({ color, size }) => {
                return <Icon name="map" size={size} color={color} />;
              },
            }}
            listeners={{
              tabPress: async (e) => {
                // Prevent default action
                e.preventDefault();
                // Trigger your action here (e.g., refresh)
                setIsOpenMap(true);
                // Then navigate manually
              },
            }}
          >
            {() => (
              <OrdersMap
                orders={orders}
                isOpen={isOpenMap}
                closeModal={() => setIsOpenMap(false)}
              />
            )}
          </Tab.Screen>}
          <Tab.Screen
            name="DetalleHoja"
            options={{
              tabBarLabel: "Hoja de Ruta",
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
    bottom: 25,
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
