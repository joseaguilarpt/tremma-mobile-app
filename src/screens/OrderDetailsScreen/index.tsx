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
import { getOrderById } from "@/api/orders";
import { useLoading } from "@/context/loading.utils";
import { useAuth } from "@/context/auth";
import OrdersMap from "@/components/Map/Map";
import OrderDetails from "../OrderDetails";
import { getClientById } from "@/api/clients";
import OrderPayments from "../Payments";

const Tab = createBottomTabNavigator();

export default function OrderDetailsScreen() {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as { [key: string]: string | number };

  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();
  const { user } = useAuth();

  const [orders, setOrders] = React.useState([]);
  const [isOpenMap, setIsOpenMap] = React.useState(false);
  const [order, setOrder] = React.useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(params?.Id);
      const client = await getClientById(response?.Cliente?.Codigo);
      setOrder({
        ...params,
        ...response,
        Cliente: client,
      });
      if (response.Id) {
        setOrders([{ ...params, ...response }]);
      }
    } catch (error) {
      showSnackbar(
        "Error al carga el Pedido, por favor intente nuevamente",
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
              tabBarLabel: "Detalle",
              tabBarIcon: ({ color, size }) => {
                return <Icon name="list" size={size} color={color} />;
              },
            }}
          >
            {() => (
              <OrderDetails
                onOrdersChange={setOrders}
                id={params.Numero}
                order={order}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="OrderPayments"
            options={{
              tabBarLabel: "Pago",
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                return <Icon name="money" size={size} color={color} />;
              },
            }}
          >
            {() => <OrderPayments id={params.id} orders={orders} order={order} />}
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
