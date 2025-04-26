import { dayCR } from "@/utils/dates";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import {
  Chip,
  Surface,
  Text,
  TouchableRipple,
  useTheme,
} from "react-native-paper";
import OrderMenu from "../OrderMenu";

const OrderCard = ({ order, color = "rgb(18, 86, 107)", onClick }) => {
  const navigator = useNavigation();

  const getColor = (estado) => {
    switch (estado) {
      case "Asignado":
        return "rgb(18, 86, 107)";
      case "Pendiente":
        return "rgb(255, 193, 7)";
      case "Anulado":
        return "rgb(255, 82, 82)";
      case "No Cargado":
        return "rgb(134, 71, 71)";
      default:
        return "rgb(33, 64, 110)";
    }
  };

  const colorValue = getColor(order.Estado);
  return (
    <>
      <TouchableRipple onPress={() => onClick(order)} rippleColor={color}>
        <Surface style={styles.roadmap} elevation={4}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              width: "85%",
              marginTop: 10,
            }}
          >
            <View>
              <Text variant="labelLarge">Pedido:</Text>
              <Text variant="labelLarge">Cliente:</Text>
              <Text variant="labelLarge">Bultos:</Text>
            </View>
            <View style={{ paddingLeft: 20 }}>
              <Text variant="bodyMedium">{order.Numero ?? "-"}</Text>
              <Text variant="bodyMedium">{`${order?.CodigoCliente} - ${order.NombreCliente}`}</Text>
              <Text variant="bodyMedium">{order.Bultos ?? "-"}</Text>
            </View>
          </View>
          <Chip
            mode="flat"
            style={{
              backgroundColor: colorValue,
              position: "absolute",

              height: 26,
              right: 10,
              top: 10,
            }}
            textStyle={{ color: "white", fontSize: 12, lineHeight: 14 }}
          >
            {order.Estado}
          </Chip>
        </Surface>
      </TouchableRipple>
    </>
  );
};

const styles = StyleSheet.create({
  roadmap: {
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    flexGrow: 1,
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default OrderCard;
