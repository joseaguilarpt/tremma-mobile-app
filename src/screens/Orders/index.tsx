import React, { useCallback, useRef } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import OrderCard from "@/components/OrderCard/OrderCard";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import OrderSheet from "@/components/OrderMenu";
import Spacer from "@/components/Spacer/Spacer";
import { useRoadmap } from "@/context/roadmap";

function Orders({
  id,
  onRefresh,
  onStartRoadmap,
}: {
  id: string;
  onRefresh?: () => void;
  onStartRoadmap: () => void;
}) {
  const navigator = useNavigation();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const { orders, roadmap } = useRoadmap();
  
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleClick = (order) => {
    setSelectedOrder(order);
    openSheet();
  };
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
          <Text variant="titleMedium">
            {orders.length > 0 ? orders?.length : ""} Pedido(s):
          </Text>
          <Spacer size={16} />
          <View>
            {orders.map((order) => (
              <OrderCard
                onClick={handleClick}
                key={order.Numero}
                order={order}
                color="rgb(18, 86, 107)"
              />
            ))}
          </View>
        </View>
        <OrderSheet
          roadmap={roadmap}
          closeSheet={closeSheet}
          selectedOrder={selectedOrder}
          bottomSheetRef={bottomSheetRef}
        />
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});

export default Orders;
