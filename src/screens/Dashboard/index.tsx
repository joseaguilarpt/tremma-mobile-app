import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  useTheme,
  Appbar,
  Avatar,
} from "react-native-paper";
import { useAuth } from "@/context/auth";


function Dashboard() {
  const theme = useTheme();
  const { imageSrc, user } = useAuth();

  const _handleMore = () => console.log("Shown more");

  return (
    <View>
      <Appbar.Header>
        {imageSrc && (
          <Avatar.Image
            style={styles.avatar}
            size={40}
            source={{ uri: imageSrc }}
          />
        )}
        {!imageSrc && user?.name && (
          <Avatar.Text
            style={styles.avatar}
            size={40}
            label={user.name.charAt(0)}
          />
        )}
        <Appbar.Content title="" />
        <Appbar.Action icon="message" onPress={_handleMore} />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="titleLarge">Bienvenido a Tremma</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingTop: 16, // Evita solapamiento con la StatusBar en Android
  },
  divider: {
    margin: 16,
  },
  avatar: {
    marginLeft: 10,
  },
  settings: {
    flexDirection: "row", // Llenar las filas de manera horizontal
    flexWrap: "wrap", // Permite que los elementos se muevan a la siguiente línea
    //alignItems: "center", // Alineación vertical
    justifyContent: "flex-start", // Alineación entre los elementos    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
  },
  flex: {
    paddingLeft: 20,
    // display: 'flex'
  },
});

export default Dashboard;
