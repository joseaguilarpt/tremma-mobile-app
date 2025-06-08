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
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/Routes";
import { useNavigation } from "@react-navigation/native";
import NavigationBar from "@/components/NavigationBar/NavigationBar";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import RoadmapCard from "@/components/RoadmapCard/RoadmapCard";
import { useLoading } from "@/context/loading.utils";
import Spacer from "@/components/Spacer/Spacer";
import { Roadmap } from "@/types/Roadmap";
import { useRoadmap } from "@/context/roadmap";

function Dashboard() {
  const theme = useTheme();
  const navigator =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setLoading } = useLoading();
  const [current, setCurrent] = React.useState<Roadmap | null>(null);
  const [roadmaps, setRoadmaps] = React.useState<Roadmap[]>([]);
  const [statistics, setStatistics] = React.useState({
    orders: 0,
    returns: 0,
    roadmaps: 0,
  });

  const { showSnackbar } = useNotifications();
  const { roadmap, orders } = useRoadmap();

  const fetchData = async () => {
    setLoading(true);
    try {

      const totalOrders = roadmap?.TotalPedidos ?? 0;
      const totalReturns = roadmap?.TotalDevoluciones ?? 0;

      setCurrent(roadmap)
      setStatistics({
        orders: totalOrders,
        returns: totalReturns,
        roadmaps: 0,
      });
    } catch (error) {
      showSnackbar(
        "Error al cargar las hojas de ruta, por favor intente nuevamente",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const initialize = useCallback(() => {
    if (roadmap) {
      fetchData();
    }
  }, [roadmap, orders]);

  useFocusEffect(initialize);

  return (
    <ProtectedRoute>
      <ScrollView>
        <NavigationBar />
        <View style={styles.container}>
          <Text variant="titleLarge">Bienvenido a Arrow</Text>
          <Surface style={styles.surface} elevation={4}>
            <Image
              source={require("../../assets/images/tremma-car.png")}
              style={styles.companyImage}
            />
          </Surface>
          <View style={styles.cards}>
            {current !== null && (
              <Surface
                style={[
                  styles.cardTopData,
                  {
                    backgroundColor: "rgba(231, 87, 31, 0.8)",
                  },
                ]}
                elevation={4}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  <Icon
                    source="bus-alert"
                    size={40}
                    color={theme.colors.onPrimary}
                  />
                  <View style={{ paddingLeft: 20 }}>
                    <Text variant="titleLarge">Hoja de Ruta en Curso</Text>
                    <Text
                      variant="bodyMedium"
                      style={{ marginBottom: 20, fontWeight: "bold" }}
                    >
                      Continuar con la hoja de ruta en curso
                    </Text>
                  </View>
                </View>
                <View>
                  <RoadmapCard
                    color="rgb(177, 139, 67)"
                    key={current.Id}
                    roadmap={current}
                  />
                </View>
              </Surface>
            )}
            {current === null && statistics.roadmaps === 0 && (
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
              <Surface
                style={[
                  styles.cardTopData,
                  {
                    backgroundColor:
                      current === null ? "rgba(231, 87, 31, 0.8)" : "",
                  },
                ]}
                elevation={4}
              >
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  divider: {
    margin: 16,
  },
  avatar: {
    marginLeft: 10,
  },
  flex: {
    paddingLeft: 20,
  },
  surface: {
    height: 200,
    marginTop: 20,
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
  },
  companyImage: {
    width: 400,
    height: 200,
    alignSelf: "center",
    resizeMode: "contain",
  },
  cards: {
    marginTop: 20,
    display: "flex",
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
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  cardTopData: {
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
    padding: 20,
  },
});

export default Dashboard;
