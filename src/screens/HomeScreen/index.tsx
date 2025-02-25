import React from "react";

import { CommonActions } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BottomNavigation,
  useTheme,
} from "react-native-paper";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import SettingsScreen from "../Settings";
import Dashboard from "../Dashboard";

const Tab = createBottomTabNavigator();

export default function HomeView() {
  const theme = useTheme();
  return (
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
        name="Hojas"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Hojas",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="list" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Pedidos",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="send" size={size} color={color} />;
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
  );
}
