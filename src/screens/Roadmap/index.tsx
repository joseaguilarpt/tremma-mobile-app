import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { formatMoney } from "@/utils/money";
import { useRoadmap } from "@/context/roadmap";

function Roadmap({
  id,
  onStartRoadmap,
  onRefresh
}: {
  id: string;
  onRefresh: () => void;
  onStartRoadmap: () => void;
}) {
  const navigator = useNavigation();
  const { roadmap } = useRoadmap();

  const ordersCount = (roadmap?.Pedidos ?? []).filter(
    (item) => !item.Bloqueado
  ).length;
  const data = [
    {
      label: "Ruta",
      value: roadmap?.Ruta,
    },
    {
      label: "Total de Clientes",
      value: roadmap?.TotalClientes,
    },
    {
      label: "Total de Pedidos",
      value: ordersCount,
    },
    {
      label: "Total de Bultos",
      value: roadmap?.TotalBultos,
    },
    {
      label: "Monto Crédito",
      value: formatMoney(roadmap?.TotalCredito),
    },
    {
      label: "Monto Contado",
      value: formatMoney(roadmap?.TotalMonto),
    },
    {
      label: "Total de Devoluciones",
      value: roadmap?.TotalDevoluciones,
    },
  ];

  return (
    <ProtectedRoute>
      <ScrollView>
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              navigator.goBack();
            }}
          />
          <Appbar.Content
            title={
              <View>
                <Text variant="titleMedium">Hoja de Ruta:</Text>
                <Text>{id}</Text>
              </View>
            }
          />
          <Appbar.Action icon="refresh" onPress={onRefresh} />
          <Appbar.Action icon="send" onPress={onStartRoadmap} />
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

export default Roadmap;
