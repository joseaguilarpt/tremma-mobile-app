import React from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  Icon,
  TouchableRipple,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import NavigationBar from "@/components/NavigationBar/NavigationBar";

const Spacer = ({ size = 8, horizontal = false }) => (
  <View style={{ [horizontal ? "width" : "height"]: size }} />
);

function Dashboard() {
  const theme = useTheme();
  const navigator = useNavigation();
  return (
    <ScrollView>
      <NavigationBar />
      <View style={styles.container}>
        <Text variant="titleLarge">Bienvenido a Tremma</Text>
        <Surface style={styles.surface} elevation={4}>
          <Image
            source={require("../../assets/images/tremma-car.png")}
            style={styles.truck}
          />
        </Surface>
        <View style={styles.cards}>
          <TouchableRipple
            onPress={() => navigator.navigate("Home")}
            rippleColor="rgb(67, 170, 177)"
          >
            <Surface style={styles.cardTop} elevation={4}>
              <View>
                <Icon source="bus" size={40} color={theme.colors.onPrimary} />
              </View>
              <View style={styles.flex}>
                <Text variant="titleLarge">Hojas de Ruta</Text>
                <Text variant="bodyMedium">Hojas pendientes</Text>
                <Text variant="bodyMedium">Hojas cerradas</Text>
              </View>
            </Surface>
          </TouchableRipple>
          <Spacer size={20} />
          <TouchableRipple
            onPress={() => navigator.navigate("Home")}
            rippleColor="rgb(67, 170, 177)"
          >
            <Surface style={styles.card} elevation={4}>
              <View>
                <Icon
                  source="barcode"
                  size={40}
                  color={theme.colors.onPrimary}
                />
              </View>
              <View style={styles.flex}>
                <Text variant="titleLarge">Pedidos</Text>
                <Text variant="bodyMedium">Pedidos pendientes</Text>
                <Text variant="bodyMedium">Pedidos completados</Text>
              </View>
            </Surface>
          </TouchableRipple>
          <Spacer size={20} />
          <TouchableRipple
            onPress={() => navigator.navigate("Home")}
            rippleColor="rgb(67, 170, 177)"
          >
            <Surface style={styles.card} elevation={4}>
              <View>
                <Icon source="cash" size={40} color={theme.colors.onPrimary} />
              </View>
              <View style={styles.flex}>
                <Text variant="titleLarge">Gestion de Pagos</Text>
                <Text variant="bodyMedium">Pagos pendientes</Text>
                <Text variant="bodyMedium">Pagos realizados</Text>
              </View>
            </Surface>
          </TouchableRipple>  
        </View>
      </View>
    </ScrollView>
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
  surface: {
    height: 200,
    marginTop: 20,
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
  },
  truck: {
    width: 400,
    height: 200,
    alignSelf: "center",
    resizeMode: "contain",
  },
  cards: {
    marginTop: 20,
    display: "flex",
    //flexDirection: "row",
    //alignItems: "center",
  },
  card: {
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  cardTop: {
    backgroundColor: "rgba(255, 74, 2, 0.8)",
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default Dashboard;
