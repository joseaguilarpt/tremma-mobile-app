import React, { useCallback, useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Badge, Icon, Text, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import OrderCard from "@/components/OrderCard/OrderCard";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import OrderSheet from "@/components/OrderMenu";
import Spacer from "@/components/Spacer/Spacer";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Order, Roadmap } from "@/types/Roadmap";

function OnGoingOrders({
  id,
  orders,
  roadmap,
  onOrdersChange,
}: {
  id: string;
  roadmap: Roadmap;
  orders: Order[];
  onOrdersChange: (orders: Order[], change: { [key: string]: number }) => void;
}) {
  const navigator = useNavigation();
  const flatListRef = useRef(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { messages } = useNotifications();
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleClick = (order, isReturn = false) => {
    if (isReturn) {
      navigator.navigate("ReturnDetails", { id: order.Id, ...order });
      return;
    }
    setSelectedOrder(order);
    navigator.navigate("OrderDetails", { id: order.Id, ...order });
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    return (
      <ScaleDecorator key={item.key} activeScale={1.08}>
        <OrderCard
          {...item}
          key={item.key}
          disabled={isActive}
          onClick={handleClick}
          onLongPress={drag}
          order={item}
          showLocation
          showTimes
          style={[
            {
              backgroundColor: item.backgroundColor,
              opacity: isActive ? 0.7 : 1,
            },
          ]}
        />
        {(item.Devoluciones ?? []).length > 0 &&
          item.Devoluciones.map((order) => (
            <View key={order.PedidoId} style={{ paddingLeft: 30 }}>
              <OrderCard
                {...order}
                key={order.PedidoId}
                disabled={isActive}
                showLocation
                showTimes
                onClick={(v) => handleClick(v, true)}
                order={{ ...order, Estado: "Devolución" }}
                style={[
                  {
                    backgroundColor: order.backgroundColor,
                    opacity: isActive ? 0.7 : 1,
                  },
                ]}
              />
            </View>
          ))}
      </ScaleDecorator>
    );
  };

  const ListHeader = () => {
    const totalOrders = orders.filter((item) => !item.PedidoId).length;
    return (
      <View style={styles.headerContainer}>
        <Text variant="titleMedium">
          {totalOrders > 0 ? totalOrders : ""} Pedido(s):
        </Text>
        <Spacer size={16} />
      </View>
    );
  };

  return (
    <ProtectedRoute>
      <View style={styles.screenContainer}>
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
                <Text>{roadmap.Numero}</Text>
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

        <DraggableFlatList
          ref={flatListRef}
          data={orders}
          onDragEnd={({ data, from, to }) => {
            onOrdersChange(data, { from, to });
          }}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          autoscrollThreshold={100}
          autoscrollSpeed={200}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContainer}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />

        <OrderSheet
          roadmap={roadmap}
          closeSheet={closeSheet}
          selectedOrder={selectedOrder}
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },
  headerContainer: {
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

export default OnGoingOrders;
