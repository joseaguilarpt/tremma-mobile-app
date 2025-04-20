import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { Appbar, Chip, Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { getRoadmapsList } from "@/api/roadmap";
import { useAuth } from "@/context/auth";
import RoadmapCard from "@/components/RoadmapCard/RoadmapCard";
import DatesDrawer from "@/components/Dates/DatesDrawer";
import FilterDrawer from "@/components/Filters/FiltersDrawer";
import { dayCR } from "@/utils/dates";

const Spacer = ({ size = 8, horizontal = false }) => (
  <View style={{ [horizontal ? "width" : "height"]: size }} />
);

function Roadmaps() {
  const theme = useTheme();
  const navigator = useNavigation();
  const [datesDrawerVisible, setDatesDrawerVisible] = useState(false);
  const translateY = React.useRef(new Animated.Value(300)).current; // Animación para el Drawer
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false); // Estado para el filtro del Drawer
  const [filter, setFilter] = useState(""); // Estado para el filtro
  const [selectedRange, setSelectedRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [roadmaps, setRoadmaps] = React.useState([]);
  const [statistics, setStatistics] = React.useState({
    orders: 0,
    returns: 0,
    roadmaps: 0,
  });

  const { user } = useAuth();
  const { showSnackbar } = useNotifications();

  const openDrawer = () => {
    setDatesDrawerVisible(true);
    if (filterDrawerVisible) {
      closeFilterDrawer();
    }
    Animated.spring(translateY, {
      toValue: 0, // Mueve el Drawer hacia arriba
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.spring(translateY, {
      toValue: 0, // Mueve el Drawer hacia abajo
      useNativeDriver: true,
    }).start(() => setDatesDrawerVisible(false));
  };

  const openFilterDrawer = () => {
    setFilterDrawerVisible(true);
    if (datesDrawerVisible) {
      closeDrawer();
    }
    Animated.spring(translateY, {
      toValue: 0, // Mueve el Drawer hacia arriba
      useNativeDriver: true,
    }).start();
  };

  const closeFilterDrawer = () => {
    Animated.spring(translateY, {
      toValue: 0, // Mueve el Drawer hacia abajo
      useNativeDriver: true,
    }).start(() => setFilterDrawerVisible(false));
  };

  const applyFilter = () => {
    closeFilterDrawer();
  };

  const fetchData = async () => {
    try {
      const { Items = [], TotalCount } = await getRoadmapsList({
        Conductor: user.Id,
        PageSize: 100,
        minDate: dayCR().startOf("D").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        // Estado: "Pendiente"
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
  };

  const initialize = useCallback(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  useFocusEffect(initialize);

  const filteredRoadmaps = roadmaps.filter((item) => {
    const matchesFilter = () => {
      const filterLower = filter.toLowerCase();
      return (
        item.Numero.toLowerCase().includes(filterLower) ||
        item.Ruta?.toLowerCase()?.includes(filterLower)
      );
    };

    const matchesDateRange = () => {
      const itemDate = dayCR(item.Fecha);
      return itemDate.isBetween(
        dayCR(selectedRange.startDate),
        dayCR(selectedRange.endDate),
        "day",
        "[]"
      );
    };

    if (filter && selectedRange.startDate && selectedRange.endDate) {
      return matchesFilter() && matchesDateRange();
    }
    if (filter) {
      return matchesFilter();
    }
    if (selectedRange.startDate && selectedRange.endDate) {
      return matchesDateRange();
    }
    return true;
  });

  return (
    <ProtectedRoute>
      <ScrollView>
        <Appbar.Header>
          <Appbar.BackAction
           onPress={() => {
            if (datesDrawerVisible || filterDrawerVisible) {
              closeDrawer();
              closeFilterDrawer();
            } else {
              navigator.goBack();
            }
          }}
          />
          <Appbar.Content title="Hojas de Ruta" />
          <Appbar.Action
            icon="calendar"
            onPress={() => {
              if (datesDrawerVisible) {
                closeDrawer();
              } else {
                openDrawer();
              }
            }}
          />
          <Appbar.Action icon="magnify" onPress={openFilterDrawer} />
        </Appbar.Header>
        {datesDrawerVisible && (
          <DatesDrawer
            closeDrawer={closeDrawer}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
          />
        )}
        {filterDrawerVisible && (
          <FilterDrawer
            closeDrawer={closeFilterDrawer}
            filter={filter}
            setFilter={setFilter}
            onApply={applyFilter}
            title="Buscar Hoja de Ruta"
          />
        )}
        {!datesDrawerVisible && !filterDrawerVisible && (
          <View style={styles.container}>
            <View style={{ flexDirection: "row" }}>
              {selectedRange.startDate && selectedRange.endDate && (
                <Chip
                  onClose={() => {
                    setSelectedRange({
                      endDate: null,
                      startDate: null,
                    });
                  }}
                  style={{ width: 230 }}
                  icon="calendar"
                  onPress={() => {
                    setSelectedRange({
                      endDate: null,
                      startDate: null,
                    });
                  }}
                >
                  {selectedRange.startDate} - {selectedRange.endDate}
                </Chip>
              )}
              {filter && (
                <Chip
                  onClose={() => {
                    setFilter("");
                  }}
                  style={{ maxWidth: 160, marginLeft: 10 }}
                  icon="note"
                  onPress={() => {
                    setFilter("");
                  }}
                >
                  {filter}
                </Chip>
              )}
            </View>
            <View style={styles.cards}>
              <View>
                {filteredRoadmaps.length === 0 && (
                  <>
                    <Text variant="bodyMedium">
                      Estamos procesando las rutas.
                    </Text>
                    <Text variant="bodyMedium">
                      No hay hojas de ruta disponibles para mostrar.
                    </Text>
                  </>
                )}
                {filteredRoadmaps.length > 0 && (
                  <>
                    <View style={styles.roadmapCards}>
                      <Text
                        variant="bodyMedium"
                        style={{ marginBottom: 20, fontWeight: "bold" }}
                      >
                        {statistics.roadmaps} Hojas de ruta asignadas
                      </Text>
                      {(filteredRoadmaps ?? []).map((roadmap) => (
                        <RoadmapCard key={roadmap.Id} roadmap={roadmap} />
                      ))}
                    </View>
                  </>
                )}
              </View>

              <Spacer size={20} />
            </View>
          </View>
        )}
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
});

export default Roadmaps;
