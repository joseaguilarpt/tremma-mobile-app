import React, { useEffect, useState } from "react";
import DatesDrawer from "@/components/Dates/DatesDrawer";
import FilterDrawer from "@/components/Filters/FiltersDrawer";
import { useNotifications } from "@/context/notification";
import { useNavigation } from "@react-navigation/native";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Avatar,
  Button,
  Chip,
  Divider,
  Icon,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import isBetween from "dayjs/plugin/isBetween";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";

dayjs.extend(isBetween);

dayjs.locale("es");
dayjs.extend(relativeTime);

const formatMessageDate = (dateString: string) => {
  const date = dayjs(dateString);

  if (date.isSame(dayjs(), "d")) {
    return date.format("HH:mm");
  } else if (date.isSame(dayjs().subtract(1, "d"), "d")) {
    return "Ayer";
  } else if (date.isSame(dayjs(), "year")) {
    return date.format("D MMM"); // Ej: "5 abr"
  } else {
    return date.format("D MMM YYYY");
  }
};

const setTruncatedText = (v: string, max: number = 50) => {
  return v?.length > max ? `${v.slice(0, max)}...` : v;
};

export default function Messages() {
  const navigator = useNavigation();
  const { messages, getMessages } = useNotifications();
  const theme = useTheme();
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

  useEffect(() => {
    getMessages();
  }, []);

  // Función para generar fechas intermedias entre la fecha de inicio y fin
  const generateIntermediateDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];

    while (start < end) {
      start.setDate(start.getDate() + 1);
      dates.push(start.toISOString().split("T")[0]); // Agregar fecha en formato YYYY-MM-DD
    }

    return dates;
  };

  const markedDates = {};
  if (selectedRange.startDate) {
    markedDates[selectedRange.startDate] = {
      selected: true,
      startingDate: true,
      color: "rgba(255, 74, 2, 0.8)",
    };
  }
  if (selectedRange.endDate) {
    markedDates[selectedRange.endDate] = {
      selected: true,
      endingDay: true,
      color: "rgba(255, 74, 2, 0.8)",
    };
  }

  // Marcar las fechas intermedias con un color diferente
  if (selectedRange.startDate && selectedRange.endDate) {
    const intermediateDates = generateIntermediateDates(
      selectedRange.startDate,
      selectedRange.endDate
    );
    intermediateDates.forEach((date) => {
      markedDates[date] = {
        selected: true,
        color: "rgba(255, 74, 2, 0.8)",
      };
    });
  }

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

  const filteredMessages = messages.filter((item) => {
    const matchesFilter = () => {
      const filterLower = filter.toLowerCase();
      return (
        item.Descripcion.toLowerCase().includes(filterLower) ||
        item.Asunto?.toLowerCase()?.includes(filterLower) ||
        `${item.UserEnvia?.Nombre} ${item.UserEnvia?.Apellido1}`
          .toLowerCase()
          .includes(filterLower)
      );
    };

    const matchesDateRange = () => {
      const itemDate = dayjs(item.Fecha);
      return itemDate.isBetween(
        dayjs(selectedRange.startDate),
        dayjs(selectedRange.endDate),
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
                navigator.navigate("Home");
              }
            }}
          />
          <Appbar.Content title="Mensajes" />
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
          />
        )}
        {!datesDrawerVisible && !filterDrawerVisible && (
          <View style={styles.container}>
            <View style={{ flexDirection: "row", marginTop: 20 }}>
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

            <View
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: "row",
                marginTop: 10,
              }}
            >
              {(messages ?? []).length > 0 && (
                <View>
                  <Text style={{ fontWeight: "bold" }}>Mensajes sin leer:</Text>
                  <Text> {messages.length}</Text>
                </View>
              )}
              <Button
                mode="contained"
                icon={"send"}
                onPress={() => {
                  navigator.navigate("AddMessage");
                }}
              >
                Nuevo Mensaje
              </Button>
            </View>
            <Divider
              style={{
                margin: 16,
              }}
            />
            {(filteredMessages ?? []).length === 0 && (
              <View
                style={{
                  justifyContent: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <View>
                  <View
                    style={{
                      justifyContent: "center",
                      flexDirection: "row",
                      marginBottom: 10,
                    }}
                  >
                    <Icon source={"message"} size={40} />
                  </View>
                  <Text>No hay mensajes para mostrar en este momento.</Text>
                </View>
              </View>
            )}
            {(filteredMessages ?? []).length > 0 && (
              <View>
                {filteredMessages.map((item) => {
                  const description = setTruncatedText(item?.Descripcion);
                  const title = setTruncatedText(
                    `${item.UserEnvia?.Nombre} ${item.UserEnvia?.Apellido1}`,
                    25
                  );
                  const subTitle = setTruncatedText(item.Asunto, 30);
                  const date = formatMessageDate(item.Fecha);
                  return (
                    <TouchableRipple
                      onPress={() =>
                        navigator.navigate("AddMessage", { id: item.Id })
                      }
                      rippleColor="rgb(67, 170, 177)"
                      key={item.Id}
                      style={styles.surfaceMessageContainer}
                    >
                      <Surface style={styles.surfaceMessage}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <View>
                            <Avatar.Text
                              size={35}
                              label={item?.UserEnvia?.Nombre.charAt(0) ?? ""}
                            />
                          </View>
                          <View style={{ paddingLeft: 10 }}>
                            <Text variant="titleMedium">{title}</Text>
                            <Text variant="bodyLarge">{subTitle}</Text>
                            <Text style={{ paddingTop: 5 }} variant="bodySmall">
                              {description}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.date}>
                          <Text variant="labelSmall">{date}</Text>
                          {!item.Confirmado && (
                            <Chip style={styles.newMessageChip}>No Leido</Chip>
                          )}
                        </View>
                      </Surface>
                    </TouchableRipple>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  surfaceMessage: {
    padding: 20,
    paddingLeft: 10,
    backgroundColor: "rgba(46, 64, 82, 0.8)",
  },
  surfaceMessageContainer: {
    marginBottom: 5,
    position: "relative",
  },
  newMessageChip: {
    backgroundColor: "green",
    padding: 0,
    marginTop: 4,
  },
  date: {
    position: "absolute",
    top: 12,
    right: 12,
  },
});
