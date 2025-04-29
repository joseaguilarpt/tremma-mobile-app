import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeView from "./src/screens/HomeScreen";
import NotFoundScreen from "./src/screens/+not-found";
import LoginScreen from "@/screens/LoginScreen";
import ChangePassword from "@/screens/Account/ChangePassword";
import Messages from "@/screens/Messages/Messages";
import AddMessage from "@/screens/Messages/AddMessage";
import RoadmapView from "@/screens/RoadmapScreen";

const Stack = createNativeStackNavigator();

export default function Router() {
  return (
    <Stack.Navigator id={undefined}>
      <Stack.Screen
        name="Home"
        component={HomeView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Roadmap"
        component={RoadmapView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cuenta"
        component={HomeView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Messages"
        component={Messages}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMessage"
        component={AddMessage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

