import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Chip, Surface, Text, TouchableRipple } from "react-native-paper";
import { ListItem } from "../ListItem/ListItem";

const OrderCard = ({
  order,
  color = "rgb(18, 86, 107)",
  onClick,
  showLocation = false,
  showTimes = false,
  ...rest
}) => {
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
      case "Devolución":
        return "rgb(134, 71, 71)";
      default:
        return "rgb(33, 64, 110)";
    }
  };

  const colorValue = getColor(order.Estado);
  return (
    <>
      <TouchableRipple
        onPress={() => onClick(order)}
        rippleColor={color}
        {...rest}
      >
        <Surface style={styles.roadmap} elevation={4}>
          {order.PedidoId && (
            <ListItem title={"WMS"} description={order.PedidoId ?? "-"} />
          )}
          <ListItem title={"Pedido"} description={order.Numero ?? "-"} />
          <ListItem
            title={"Cliente"}
            description={order.NombreCliente ?? "-"}
          />
          <ListItem title={"Bultos"} description={order.Bultos ?? "-"} />
          {showLocation && (
            <ListItem
              title={"Ubicación"}
              description={order.Direccion ?? "-"}
            />
          )}

          {showTimes && (
            <ListItem title={"Horario"} description={order.Horario ?? "-"} />
          )}
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

export default OrderCard;
