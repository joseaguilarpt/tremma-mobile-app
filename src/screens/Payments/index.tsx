import React, { useCallback, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Badge, Icon, Text, TouchableRipple } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";

import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ScrollView } from "react-native-gesture-handler";
import OrderInvalidateSheet from "@/components/OrderInvalidate";
import { CreditPayments } from "./CreditPayments";
import DisplayList from "@/components/DisplayList";
import { CashPayments } from "./CashPayments";
import { useRoadmap } from "@/context/roadmap";

enum PaymentType {
  Credit = 1,
  Cash = 2,
}

function OrderPayments() {
  const navigator = useNavigation();
  const { messages } = useNotifications();
  const { order } = useRoadmap()

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const data = [
    {
      label: "Número de Pedido",
      value: order?.Numero ?? "-",
    },
    {
      label: "Condición de pago",
      value: order?.CondicionPago?.Descripcion ?? "-",
    },
  ];

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
                <Text variant="titleMedium">Gestión de Pagos:</Text>
                <Text>Pedido: {order?.Numero}</Text>
              </View>
            }
          />
          <Appbar.Action
            onPress={openSheet}
            icon={({ size, color }) => (
              <TouchableRipple>
                <View>
                  <Icon source="archive-off" size={24} />
                </View>
              </TouchableRipple>
            )}
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

        <ScrollView style={styles.container}>
          <Text variant="titleMedium">Detalles:</Text>
          <DisplayList data={data} />
          {order?.CondicionPago?.Id === PaymentType.Cash ? (
            <CashPayments />
          ) : (
            <CreditPayments />
          )}
        </ScrollView>
        <OrderInvalidateSheet
          closeSheet={closeSheet}
          selectedOrder={order}
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 180,
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
    padding: 15,
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  textArea: {
    marginHorizontal: 0,
    flex: 1,
    marginTop: 10,
    height: 100,
  },
});

export default OrderPayments;
