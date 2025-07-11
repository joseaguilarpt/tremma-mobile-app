import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation, useTheme } from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Roadmap from "../Roadmap";
import Orders from "../Orders";
import { useNotifications } from "@/context/notification";
import { useRoadmap } from "@/context/roadmap";
import { startRoadmap } from "@/api/orders";
import { useLoading } from "@/context/loading.utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnGoingScreen from "../OnGoingScreen";

const Tab = createBottomTabNavigator();

const OrdersTab = (props) => <Orders {...props} />;

export default function RoadmapView() {
  const theme = useTheme();
  const route = useRoute();
  const navigate = useNavigation();
  const params = route.params as { id: string };
  const { showSnackbar } = useNotifications();
  const { setLoading } = useLoading();
  const { orders, roadmap, refresh } = useRoadmap();

  const storeActiveRoadmap = async () => {
    try {
      await AsyncStorage.setItem("active-roadmap", String(roadmap.Id));
    } catch (error) {
      console.error("Error loading active order:", error);
    }
  };

  const handleStartRoadmap = async () => {
    const hasMissing = (orders ?? []).some((item) => item.Estado !== "Cargado");
    try {
      if (hasMissing) {
        showSnackbar(
          "Para continuar, asegúrate de que todos los pedidos estén marcados.",
          "error"
        );
        return;
      }
      setLoading(true);
      await startRoadmap({ Id: roadmap.Id });
      await storeActiveRoadmap();
      navigate.navigate("OnGoingOrders", { id: roadmap.Id });
    } catch (error) {
      showSnackbar(
        "Error al inciar la Hoja de Ruta, por favor intente nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await refresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
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
                paddingHorizontal: 40,
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
            name="DetalleHoja"
            options={{
              tabBarLabel: "Detalles",
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                return <Icon name="home" size={size} color={color} />;
              },
            }}
          >
            {() => (
              <Roadmap
                id={params.id}
                onRefresh={handleRefresh}
                onStartRoadmap={handleStartRoadmap}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="OnGoingOrders"
            options={{
              tabBarLabel: "Iniciar Ruta",

              tabBarIcon: ({ color, size }) => {
                return <Icon name="send" size={size} color={color} />;
              },
            }}
            listeners={{
              tabPress: async (e) => {
                // Prevent default action
                e.preventDefault();
                // Trigger your action here (e.g., refresh)
                await handleStartRoadmap();
                // Then navigate manually
              },
            }}
          >
            {() => <OnGoingScreen />}
          </Tab.Screen>
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
              <OrdersTab
                onRefresh={handleRefresh}
                id={params.id}
                onStartRoadmap={handleStartRoadmap}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
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
