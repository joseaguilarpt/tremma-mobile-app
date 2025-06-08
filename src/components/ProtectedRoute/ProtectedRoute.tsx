import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading.utils";
import { useNotifications } from "@/context/notification";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import { Animated, Easing } from "react-native";

const AnimatedLoadingScreen = () => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [scaleValue, fadeValue]);

  return (
    <View style={styles.loading}>
      <Animated.Image
        source={require("../../assets/images/arrow-lg.png")}
        style={{
          width: 160,
          height: 120,
          alignSelf: "center",
          opacity: fadeValue,
          transform: [{ scale: scaleValue }],
        }}
      />
    </View>
  );
};

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, loaded } = useAuth();
  const [isValid, setIsValid] = React.useState(false);
  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();
  const navigation = useNavigation<any>();
  const handleIsLoggedIn = async () => {
    try {
      setLoading(true);
      const loggedIn = await isLoggedIn();
      if (!loggedIn) {
        navigation.navigate("Login");
      } else {
        setIsValid(true);
      }
    } catch (error) {
      showSnackbar(`Error checking login status: ${error}`, "error");
      navigation.navigate("Login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleIsLoggedIn();
  }, []);

  if (!loaded || !isValid) {
    return <AnimatedLoadingScreen />;
  }
  return children;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
