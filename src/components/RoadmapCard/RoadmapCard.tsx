import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { StyleSheet, View } from "react-native";
import { Surface, Text, TouchableRipple, useTheme } from "react-native-paper";

const RoadmapCard = ({ roadmap, color = "rgb(18, 86, 107)" }) => {
    const navigator = useNavigation();
  
    return (
      <TouchableRipple
        onPress={() =>
            navigator.navigate("Roadmap", { id: roadmap.Numero })
          }
        rippleColor={color}
      >
        <Surface style={styles.roadmap} elevation={4}>
          <View style={{ display: "flex", flexDirection: "row", width: "85%" }}>
            <View>
              <Text variant="labelLarge">Hoja de Ruta:</Text>
              <Text variant="labelLarge">Pedidos:</Text>
              <Text variant="labelLarge">Bultos:</Text>
              <Text variant="labelLarge">Ruta:</Text>
              <Text variant="labelLarge">Fecha Entrega:</Text>
            </View>
            <View style={{ paddingLeft: 20 }}>
              <Text variant="bodyMedium">{roadmap.Numero ?? "-"}</Text>
              <Text variant="bodyMedium">{roadmap.TotalPedidos ?? "-"}</Text>
              <Text variant="bodyMedium">{roadmap.TotalBultos ?? "-"}</Text>
              <Text variant="bodyMedium">{roadmap.Ruta ?? "-"}</Text>
              <Text variant="bodyMedium">
                {dayjs(roadmap.FechaEntrega).format("DD/MM/YY") ?? "-"}
              </Text>
            </View>
          </View>
        </Surface>
      </TouchableRipple>
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

  export default RoadmapCard;
  