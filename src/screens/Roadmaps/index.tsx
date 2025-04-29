import React, { useCallback, useState, useRef, useMemo } from "react";
import { View, StyleSheet, ScrollView, Animated } from "react-native";
import { Appbar, Chip, Text } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { getRoadmapsList } from "@/api/roadmap";
import { useAuth } from "@/context/auth";
import RoadmapCard from "@/components/RoadmapCard/RoadmapCard";
import DatesDrawer from "@/components/Dates/DatesDrawer";
import FilterDrawer from "@/components/Filters/FiltersDrawer";
import { dayCR } from "@/utils/dates";
import { useLoading } from "@/context/loading.utils";
import Spacer from "@/components/Spacer/Spacer";
import { Roadmap as RoadmapType } from "@/types/Roadmap";

const INITIAL_TRANSLATE_Y = 300;
const PAGE_SIZE = 1000;

function Roadmaps() {
  const navigator = useNavigation();
  const translateY = useRef(new Animated.Value(INITIAL_TRANSLATE_Y)).current;

  const [drawerState, setDrawerState] = useState({
    datesDrawerVisible: false,
    filterDrawerVisible: false,
  });
  const [filter, setFilter] = useState("");
  const [selectedRange, setSelectedRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [roadmaps, setRoadmaps] = useState<Partial<RoadmapType[]>>([]);
  const [statistics, setStatistics] = useState({
    orders: 0,
    returns: 0,
    roadmaps: 0,
  });

  const { user } = useAuth();
  const { showSnackbar } = useNotifications();
  const { setLoading } = useLoading();

  const toggleDrawer = useCallback(
    (type: "datesDrawerVisible" | "filterDrawerVisible", isOpen: boolean) => {
      setDrawerState((prev) => ({
        ...prev,
        [type]: isOpen,
      }));
      Animated.spring(translateY, {
        toValue: isOpen ? 0 : INITIAL_TRANSLATE_Y,
        useNativeDriver: true,
      }).start();
    },
    [translateY]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { Items = [], TotalCount } = await getRoadmapsList({
        Conductor: user.Id,
        PageSize: PAGE_SIZE,
        MinDate: dayCR().startOf("D").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        MaxDate: dayCR()
          .startOf("D")
          .add(1, "M")
          .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      });

      setRoadmaps(Items);

      const totalOrders = Items.reduce((acc, item) => acc + item.TotalPedidos, 0);
      const totalReturns = Items.reduce(
        (acc, item) => acc + (item.TotalDevoluciones || 0),
        0
      );

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
    } finally {
      setLoading(false);
    }
  }, [user.Id, setLoading, showSnackbar]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchData();
      }
    }, [user?.id, fetchData])
  );

  const filteredRoadmaps = useMemo(() => {
    return roadmaps.filter((item) => {
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
  }, [roadmaps, filter, selectedRange]);

  return (
    <ProtectedRoute>
      <ScrollView>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              if (drawerState.datesDrawerVisible || drawerState.filterDrawerVisible) {
                toggleDrawer("datesDrawerVisible", false);
                toggleDrawer("filterDrawerVisible", false);
              } else {
                navigator.goBack();
              }
            }}
          />
          <Appbar.Content title="Hojas de Ruta" />
          <Appbar.Action
            icon="calendar"
            onPress={() =>
              toggleDrawer("datesDrawerVisible", !drawerState.datesDrawerVisible)
            }
          />
          <Appbar.Action
            icon="magnify"
            onPress={() =>
              toggleDrawer("filterDrawerVisible", !drawerState.filterDrawerVisible)
            }
          />
        </Appbar.Header>
        {drawerState.datesDrawerVisible && (
          <DatesDrawer
            closeDrawer={() => toggleDrawer("datesDrawerVisible", false)}
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
          />
        )}
        {drawerState.filterDrawerVisible && (
          <FilterDrawer
            closeDrawer={() => toggleDrawer("filterDrawerVisible", false)}
            filter={filter}
            setFilter={setFilter}
            onApply={() => toggleDrawer("filterDrawerVisible", false)}
            title="Buscar Hoja de Ruta"
          />
        )}
        {!drawerState.datesDrawerVisible && !drawerState.filterDrawerVisible && (
          <View style={styles.container}>
            <View style={{ flexDirection: "row" }}>
              {selectedRange.startDate && selectedRange.endDate && (
                <Chip
                  onClose={() =>
                    setSelectedRange({ startDate: null, endDate: null })
                  }
                  style={{ width: 230 }}
                  icon="calendar"
                >
                  {selectedRange.startDate} - {selectedRange.endDate}
                </Chip>
              )}
              {filter && (
                <Chip
                  onClose={() => setFilter("")}
                  style={{ maxWidth: 160, marginLeft: 10 }}
                  icon="note"
                >
                  {filter}
                </Chip>
              )}
            </View>
            <View style={styles.cards}>
              {filteredRoadmaps.length === 0 ? (
                <>
                  <Text variant="bodyMedium">
                    Estamos procesando las rutas.
                  </Text>
                  <Text variant="bodyMedium">
                    No hay hojas de ruta disponibles para mostrar.
                  </Text>
                </>
              ) : (
                <View style={styles.roadmapCards}>
                  <Text
                    variant="bodyMedium"
                    style={{ marginBottom: 20, fontWeight: "bold" }}
                  >
                    {statistics.roadmaps} Hojas de ruta asignadas
                  </Text>
                  {filteredRoadmaps.map((roadmap) => (
                    <RoadmapCard key={roadmap.Id} roadmap={roadmap} />
                  ))}
                </View>
              )}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cards: {
    marginTop: 20,
    display: "flex",
  },
  roadmapCards: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
});

export default Roadmaps;
