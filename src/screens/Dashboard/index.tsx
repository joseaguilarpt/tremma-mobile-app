import React, { useCallback } from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import {
  Text,
  useTheme,
  Surface,
  Icon,
  TouchableRipple,
  Button,
} from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import NavigationBar from "@/components/NavigationBar/NavigationBar";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { getRoadmapsList } from "@/api/roadmap";
import { useAuth } from "@/context/auth";
import RoadmapCard from "@/components/RoadmapCard/RoadmapCard";
import { dayCR } from "@/utils/dates";
import { useLoading } from "@/context/loading.utils";

const Spacer = ({ size = 8, horizontal = false }) => (
  <View style={{ [horizontal ? "width" : "height"]: size }} />
);

function Dashboard() {
  const theme = useTheme();
  const navigator = useNavigation();
  const { setLoading }= useLoading();
  const [roadmaps, setRoadmaps] = React.useState([]);
  const [statistics, setStatistics] = React.useState({
    orders: 0,
    returns: 0,
    roadmaps: 0,
  });

  const { user } = useAuth();
  const { showSnackbar } = useNotifications();
  const fetchData = async () => {
    setLoading(true);
    try {
      const { Items = [], TotalCount = 0 } = await getRoadmapsList({
        Conductor: user.Id,
        PageSize: 1000,
        MinDate: dayCR().startOf("D").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        MaxDate: dayCR().startOf("D").add(1, 'M').format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      });
      setRoadmaps(Items);
      const totalOrders = (Items ?? []).reduce((acc, item) => {
        acc += item.TotalPedidos;
        return acc;
      }, 0);
      const totalReturns = (Items ?? []).reduce((acc, item) => {
        if (item.TotalDevoluciones) {
          acc += item.TotalDevoluciones;
        }
        return acc;
      }, 0);

      setStatistics({
        orders: totalOrders,
        returns: totalReturns,
        roadmaps: TotalCount,
      });
    } catch (error) {
      showSnackbar(
        "Error al cargar las hojas de ruta, por favor intente nuevamente",
        "error"
      );
    }
    finally {
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
            {statistics.roadmaps === 0 && (
              <Surface style={styles.cardTop} elevation={4}>
                <View>
                  <Icon source="bus" size={40} color={theme.colors.onPrimary} />
                </View>
                <View style={styles.flex}>
                  <Text variant="titleLarge">Hojas de Ruta</Text>
                  <>
                    <Text variant="bodyMedium">
                      Estamos procesando las rutas.
                    </Text>
                    <Text variant="bodyMedium">
                      No tiene hojas de ruta asignadas
                    </Text>
                  </>
                </View>
              </Surface>
            )}
            {statistics.roadmaps > 0 && (
              <Surface style={styles.cardTopData} elevation={4}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <Icon source="bus" size={40} color={theme.colors.onPrimary} />
                  <View style={{ paddingLeft: 20 }}>
                    <Text variant="titleLarge">Hojas de Ruta</Text>
                    <Text
                      variant="bodyMedium"
                      style={{ marginBottom: 20, fontWeight: "bold" }}
                    >
                      {statistics.roadmaps} Hojas de ruta asignadas
                    </Text>
                  </View>
                </View>
                <View>
                  {statistics.roadmaps > 0 && (
                    <>
                      <View style={styles.roadmapCards}>
                        {(roadmaps ?? []).slice(0, 2).map((roadmap) => (
                          <RoadmapCard
                            color="rgb(177, 139, 67)"
                            key={roadmap.Id}
                            roadmap={roadmap}
                          />
                        ))}
                      </View>
                      {roadmaps.length > 2 && (
                        <Button
                          compact
                          onPress={() => navigator.navigate("Hojas")}
                          icon={"arrow-right"}
                          textColor="white"
                          mode="text"
                        >
                          Ver todas las hojas de ruta
                        </Button>
                      )}
                    </>
                  )}
                </View>
              </Surface>
            )}
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
                  <Text variant="bodyMedium">
                    {statistics.orders} Pedidos pendientes
                  </Text>
                  <Text variant="bodyMedium">
                    {statistics.returns} Pedidos devueltos
                  </Text>
                </View>
              </Surface>
            </TouchableRipple>
            <Spacer size={20} />
          </View>
        </View>
      </ScrollView>
    </ProtectedRoute>
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
  roadmapCards: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardTop: {
    backgroundColor: "rgba(231, 87, 31, 0.8)",
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  cardTopData: {
    backgroundColor: "rgba(231, 87, 31, 0.8)",
    borderRadius: 10,
    padding: 20,
  },
});

export default Dashboard;
