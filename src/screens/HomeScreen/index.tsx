import React from "react";

import { CommonActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomNavigation, useTheme } from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import SettingsScreen from "../Settings";
import Dashboard from "@/components/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import Roadmaps from "../Roadmaps";

const Tab = createBottomTabNavigator();

export default function HomeView() {
  const theme = useTheme();
  return (
    <ProtectedRoute>
      <Tab.Navigator
        id={undefined}
        screenOptions={{
          headerShown: false,
        }}
        tabBar={({ navigation, state, descriptors, insets }) => (
          <BottomNavigation.Bar
            navigationState={state}
            safeAreaInsets={insets}
            style={{ backgroundColor: theme.colors.surface }}
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
          name="Inicio"
          component={Dashboard}
          options={{
            tabBarLabel: "Inicio",
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              return <Icon name="home" size={size} color={color} />;
            },
          }}
        />

        <Tab.Screen
          name="Cuenta"
          component={SettingsScreen}
          options={{
            tabBarLabel: "Cuenta",
            tabBarIcon: ({ color, size }) => {
              return <Icon name="user" size={size} color={color} />;
            },
          }}
        />
      </Tab.Navigator>
    </ProtectedRoute>
  );
}
