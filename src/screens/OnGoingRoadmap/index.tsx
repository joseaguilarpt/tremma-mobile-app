import React from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { Appbar, Badge, Icon, Text, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { Roadmap as RoadmapType } from "@/types/Roadmap";
import { useNotifications } from "@/context/notification";
import { useLoading } from "@/context/loading.utils";
import { useRoadmap } from "@/context/roadmap";

function OnGoingRoadmap({ id, roadmap }: { id: string; roadmap: RoadmapType }) {
  const navigator = useNavigation();
  const { messages } = useNotifications();
  const { isLoading } = useLoading();
  const { fetchData } = useRoadmap();
  const data = [
    {
      label: "Ruta",
      value: roadmap?.Ruta,
    },
    {
      label: "Pedidos pendientes",
      value: roadmap?.TotalPedidos,
    },
    {
      label: "Bultos de pedidos pendientes",
      value: roadmap?.TotalBultos,
    },
    {
      label: "Devoluciones pendientes",
      value: roadmap?.TotalDevoluciones,
    },
    {
      label: "Bultos de devoluciones",
      value: roadmap?.TotalDevoluciones,
    },
  ];

  return (
    <ProtectedRoute>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchData} />
        }
      >
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              navigator.goBack();
            }}
          />
          <Appbar.Content
            title={
              <View>
                <Text variant="titleMedium">Hoja de Ruta en Curso:</Text>
                <Text>{id}</Text>
              </View>
            }
          />
          <Appbar.Action
            onPress={() => navigator.navigate("Messages")}
            icon={({ size, color }) => (
              <TouchableRipple>
                <View>
                  <Icon source="message" size={24} />
                  {(messages ?? []).length > 0 && (
                    <Badge style={{ position: "absolute", top: -5, right: -5 }}>
                      {messages.length}
                    </Badge>
                  )}
                </View>
              </TouchableRipple>
            )}
          />
        </Appbar.Header>
        <View style={styles.container}>
          <Text variant="titleMedium">Vehiculo Asignado:</Text>
          <View style={styles.cards}>
            <View style={styles.card}>
              <Text variant="titleMedium">Placa:</Text>
            </View>
            <View style={styles.card}>
              <Text>{roadmap?.Vehiculo}</Text>
            </View>
          </View>
          <Text style={{ marginTop: 20 }} variant="titleMedium">
            Datos de la Ruta:
          </Text>
          <View style={styles.cards}>
            {data.map((item, index) => (
              <React.Fragment key={index}>
                <View style={styles.card}>
                  <Text variant="titleMedium">{item.label}:</Text>
                </View>
                <View style={styles.card}>
                  <Text>{item.value ?? "-"}</Text>
                </View>
              </React.Fragment>
            ))}
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
  cards: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    flexWrap: "wrap",

    backgroundColor: "rgba(46, 64, 82, 0.8)",
    borderRadius: 10,
  },
  card: {
    padding: 20,
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default OnGoingRoadmap;
