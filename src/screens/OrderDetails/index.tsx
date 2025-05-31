import React, { useCallback, useRef } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Appbar, Badge, Icon, Text, TouchableRipple } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { useNotifications } from "@/context/notification";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Order } from "@/types/Roadmap";
import { formatMoney } from "@/utils/money";
import { ScrollView } from "react-native-gesture-handler";
import { fetchImage } from "@/api/files";
import OrderInvalidateSheet from "@/components/OrderInvalidate";

function OrderDetails({ id, order }: { id: string; order: Order }) {
  const fileName = order?.Cliente?.Imagen;
  const navigator = useNavigation();
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (fileName && typeof fileName === "string") {
      fetchImage(fileName, "clientdata").then((d) => {
        if (d.uri) {
          setImageSrc(d.uri);
        }
      });
    }
    if (fileName && typeof fileName !== "string") {
      const url = URL.createObjectURL(fileName);

      setImageSrc(url);
    }

    if (imageSrc && !fileName) {
      setImageSrc(null);
    }

    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [fileName]);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { messages } = useNotifications();
  const openSheet = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleClick = () => {
    openSheet();
  };

  const data = [
    {
      label: "Número de pedido",
      value: order?.Numero ?? "-",
    },
    {
      label: "Nombre del cliente",
      value: order?.NombreCliente ?? "-",
    },
    {
      label: "Cantidad de bultos",
      value: order?.Bultos ?? "-",
    },
    {
      label: "Monto",
      value: order?.Monto ? formatMoney(order?.Monto) : "-",
    },
    {
      label: "Condición de pago",
      value: order?.CondicionPago?.Descripcion ?? "-",
    },
  ];

  const location = [
    {
      label: "Provincia",
      value: order?.Cliente?.Distrito?.Canton?.Provincia?.Descripcion ?? "-",
    },
    {
      label: "Cantón",
      value: order?.Cliente?.Distrito?.Canton?.Descripcion ?? "-",
    },
    {
      label: "Distrito",
      value: order?.Cliente?.Distrito?.Descripcion ?? "-",
    },
    {
      label: "Dirección exacta",
      value: order?.Cliente?.Datos?.Direccion ?? "-",
    },
  ];

  const comments = [
    {
      label: "Horario de entrega",
      value: order?.Horario ?? "-",
    },
    {
      label: "Observaciones",
      value: order?.Observaciones ?? "-",
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
                <Text variant="titleMedium">Detalle del Pedido:</Text>
                <Text>{id}</Text>
              </View>
            }
          />
          <Appbar.Action
            onPress={handleClick}
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
          <Text style={{ marginTop: 20 }} variant="titleMedium">
            Ubicación:
          </Text>
          <View style={styles.cards}>
            {location.map((item, index) => (
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
          <Text style={{ marginTop: 20 }} variant="titleMedium">
            Observaciones:
          </Text>
          <View
            style={[
              styles.cards,
              {
                marginBottom: imageSrc ? 20 : 50,
                backgroundColor: "rgb(139, 47, 47)",
              },
            ]}
          >
            {comments.map((item, index) => (
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
          {imageSrc && (
            <View style={{ marginBottom: 50, marginHorizontal: "auto" }}>
              <Image
                style={{
                  width: 250,
                  height: 300,
                }}
                source={{
                  uri: imageSrc,
                }}
              />
            </View>
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
});

export default OrderDetails;
