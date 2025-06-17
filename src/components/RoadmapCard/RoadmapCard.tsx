import { useRoadmap } from "@/context/roadmap";
import { dayCR } from "@/utils/dates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { Surface, Text, TouchableRipple } from "react-native-paper";

const RoadmapCard = ({ roadmap, color = "rgb(18, 86, 107)" }) => {
  const navigator = useNavigation<any>();
  const { orders } = useRoadmap();

  const handleNavigate = async () => {
    const activeRoadmap = await AsyncStorage.getItem("active-roadmap");
    if (String(roadmap.Id) !== String(activeRoadmap)) {
      await AsyncStorage.removeItem("active-roadmap");
      navigator.navigate("Roadmap", { id: roadmap.Numero, ...roadmap });
    } else if (
      activeRoadmap &&
      String(roadmap.Id) === String(activeRoadmap) &&
      orders.length > 0
    ) {
      navigator.navigate("OnGoingOrders", { id: roadmap.Numero });
    } else {
      navigator.navigate("CloseRoadmap", { id: roadmap.Numero });
    }
  };
  return (
    <TouchableRipple onPress={handleNavigate} rippleColor={color}>
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
            <Text
              variant="bodyMedium"
              style={{ maxWidth: 220 }}
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {roadmap.Ruta ?? "-"}
            </Text>
            <Text variant="bodyMedium">
              {dayCR(roadmap.FechaEntrega).format("DD/MM/YY") ?? "-"}
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
