import React from "react";
import { View, TouchableOpacity } from "react-native";
import { CommonActions, useRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation, useTheme } from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Roadmaps from "../Roadmaps";
import Roadmap from "../Roadmap";
import Orders from "../Orders";
import { useNotifications } from "@/context/notification";

const Tab = createBottomTabNavigator();

const OrdersTab = (props) => <Orders {...props} />;

export default function RoadmapView() {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as { id: string };
  const { showSnackbar } = useNotifications();
  return (
    <ProtectedRoute>
      {/* Contenedor del layout */}
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
          tabBar={({ navigation, state, descriptors, insets }) => (
            <BottomNavigation.Bar
              navigationState={state}
              safeAreaInsets={insets}
              style={{
                backgroundColor: theme.colors.surface,
                marginHorizontal: -40, // Espaciado extra entre las tabs
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
                return options.tabBarLabel ?? options.title ?? route.title;
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
            {() => <Roadmap id={params.id} />}
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
            {() => <OrdersTab id={params.id} />}
          </Tab.Screen>
        </Tab.Navigator>

        {/* Botón flotante en el centro */}
        <TouchableOpacity
          onPress={() => {
            showSnackbar(
              "Para continuar, asegúrate de que todos los pedidos estén marcados.",
              "error"
            );
          }}
          style={{
            position: "absolute",
            alignSelf: "center",
            bottom: 20,
            backgroundColor: theme.colors.primary,
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: "center",
            alignItems: "center",
            elevation: 5, // sombra para Android
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 }, // sombra para iOS
          }}
        >
          <Icon name="plus" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}
