import React from "react";

import { CommonActions, useRoute } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation, useTheme } from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Roadmaps from "../Roadmaps";
import Roadmap from "../Roadmap";
import Orders from "../Orders";

const Tab = createBottomTabNavigator();

const OrdersTab = (props) => <Orders {...props} />;

export default function RoadmapView() {
  const theme = useTheme();
  const route = useRoute();
  const params = route.params as { id: string };

  return (
    <ProtectedRoute>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={({ navigation, state, descriptors, insets }) => (
          <BottomNavigation.Bar
            navigationState={state}
            safeAreaInsets={insets}
            style={{ backgroundColor: theme.colors.surface }} // Set your desired background color here
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
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.title;

              return label;
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
    </ProtectedRoute>
  );
}
