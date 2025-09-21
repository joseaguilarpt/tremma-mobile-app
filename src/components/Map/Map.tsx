import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Button, IconButton, Modal } from "react-native-paper";
import * as Location from "expo-location";
import { ListItem } from "../ListItem/ListItem";
import { Order } from "@/types/Roadmap";
import { useNotifications } from "@/context/notification";

import { Linking, Platform } from "react-native";
import { MAPS_ALSA } from "@/config";

const openNavigation = async (
  latitude: number,
  longitude: number,
  label?: string,
  prefer: "google" | "waze" = "google"
) => {
  const googleMapsURL = `google.navigation:q=${latitude},${longitude}`;

  const wazeURL = `waze://?ll=${latitude},${longitude}&navigate=yes`;

  const fallbackGoogleURL = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  const openURL = async (url: string, fallbackUrl: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Linking.openURL(fallbackUrl);
    }
  };

  if (prefer === "waze") {
    await openURL(wazeURL, fallbackGoogleURL);
  } else {
    await openURL(googleMapsURL!, fallbackGoogleURL);
  }
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

const isInCostaRica = ({ latitude, longitude }: Coordinates): boolean => {
  const minLat = 8.0;
  const maxLat = 11.25;
  const minLng = -86.0;
  const maxLng = -82.5;

  return (
    latitude >= minLat &&
    latitude <= maxLat &&
    longitude >= minLng &&
    longitude <= maxLng
  );
};

function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    len = encoded.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

function getRegionForCoordinates(points) {
  if (points.length === 0) return null;

  const latitudes = points.map((p) => p.coordinate.latitude);
  const longitudes = points.map((p) => p.coordinate.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latitude = (minLat + maxLat) / 2;
  const longitude = (minLng + maxLng) / 2;

  const latitudeDelta = (maxLat - minLat) * 1.5 || 0.01;
  const longitudeDelta = (maxLng - minLng) * 1.5 || 0.01;

  return { latitude, longitude, latitudeDelta, longitudeDelta };
}

export default function OrdersMap({ isOpen, closeModal, orders }) {
  const [selectedMarker, setSelectedMarker] = React.useState(null);
  const [routeCoords, setRouteCoords] = React.useState([]);
  const [userLocation, setUserLocation] = React.useState(null);

  const { showSnackbar } = useNotifications();
  const points = useMemo(() => {
    const orderPoints = ((orders ?? []) as Order[]).map((item) => ({
      id: item.Numero,
      title: `${item.CodigoCliente} - ${item.NombreCliente}`,
      description: item.Direccion,
      time: item.Horario,
      coordinate: { latitude: item.Latitud, longitude: item.Longitud },
      label: item.Secuencia,
    }));

    if (userLocation) {
      const coord = isInCostaRica(userLocation)
        ? userLocation
        : {
            latitude: 9.9281,
            longitude: -84.0907,
          };
      return [
        {
          id: "Mi Ubicación",
          title: "",
          description: "Ubicación actual",
          coordinate: coord,
          label: "H",
        },
        ...orderPoints,
      ];
    }
    return orderPoints;
  }, [orders, userLocation]);

  const region = useMemo(() => getRegionForCoordinates(points), [points]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showSnackbar("Permiso de ubicación denegado", "error");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (points.length >= 2) {
      fetchRoute(points);
    }
  }, [points]);

  const fetchRoute = async (points) => {
    try {
          const origin = `${points[0].coordinate.latitude},${points[0].coordinate.longitude}`;
    const destination = `${points[points.length - 1].coordinate.latitude},${
      points[points.length - 1].coordinate.longitude
    }`;
    const waypoints = points
      .slice(1, -1)
      .map((p) => `${p.coordinate.latitude},${p.coordinate.longitude}`)
      .join("|");

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${MAPS_ALSA}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }`;

    const response = await fetch(url);
    const json = await response.json();
    if (json.routes.length) {
      const encoded = json.routes[0].overview_polyline.points;
      const decoded = decodePolyline(encoded);
      setRouteCoords(decoded);
    }
    } catch (error) {
      console.log(error, "error")
    }
  };

  return (
    <Modal
      visible={isOpen}
      onDismiss={closeModal}
      contentContainerStyle={styles.modal}
    >
      <View style={styles.container}>
        <MapView
          style={styles.mapa}
          initialRegion={region}
          onPress={() => setSelectedMarker(null)}
        >
          <Polyline
            coordinates={routeCoords}
            strokeColor="#000" // color de la línea
            strokeWidth={3} // grosor
          />
          {points.map((marker, index) => (
            <Marker
              onPress={() => setSelectedMarker(marker)}
              key={index ?? marker.id ?? marker.key}
              coordinate={marker.coordinate}
            >
              <View style={styles.customMarker}>
                <Text style={styles.markerLabel}>{marker.label}</Text>
              </View>
            </Marker>
          ))}
        </MapView>

        {selectedMarker && (
          <View style={styles.details}>
            <ListItem
              color="black"
              title={"Pedido"}
              description={selectedMarker?.id ?? "-"}
            />
            <ListItem
              color="black"
              title={"Cliente"}
              description={selectedMarker?.title ?? "-"}
            />
            <ListItem
              color="black"
              title={"Direccion"}
              description={selectedMarker?.description ?? "-"}
            />
            <ListItem
              color="black"
              title={"Horario"}
              description={selectedMarker?.time ?? "-"}
            />
          </View>
        )}
        <View style={styles.botonContainer}>
          <IconButton icon="close" size={30} onPress={closeModal} />
        </View>
        {selectedMarker && (
          <View style={styles.botonNavegarContainer}>
            <Button
              onPress={() =>
                openNavigation(
                  selectedMarker?.coordinate?.latitude,
                  selectedMarker?.coordinate?.longitude,
                  `Navegar a ${selectedMarker.label}`,
                  "waze"
                )
              }
              style={{ backgroundColor: "#31C6F7" }}
              textColor="black"
              mode="contained"
              icon={"waze"}
              disabled={selectedMarker.label === "H"}
            >
              Waze
            </Button>
            <Button
              disabled={selectedMarker.label === "H"}
              onPress={() =>
                openNavigation(
                  selectedMarker?.coordinate?.latitude,
                  selectedMarker?.coordinate?.longitude,
                  `Navegar a ${selectedMarker.label}`,
                  "google"
                )
              }
              style={{ backgroundColor: "#30A54E" }}
              mode="contained"
              icon={"google-maps"}
            >
              Google
            </Button>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  details: {
    backgroundColor: "white",
    position: "absolute",
    flex: 1,
    margin: 0,
    left: 10,
    bottom: 80,
    right: 10,
    padding: 10,
    boxShadow: "0px -6px 37px 0px rgba(171,170,170,0.75)",
  },
  container: { flex: 1 },
  mapa: { flex: 1 },
  botonContainer: {
    position: "absolute",
    top: 30,
    right: 20,
    borderRadius: 600,
    backgroundColor: "#2b2b2bd6",
  },
  botonNavegarContainer: {
    position: "absolute",
    bottom: 15,
    right: 10,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "flex-end",
  },
  modal: {
    flex: 1,
    backgroundColor: "white",
    margin: 0,
    justifyContent: "center",
  },
  customMarker: {
    backgroundColor: "rgba(231, 87, 31, 0.8)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "white",
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  markerLabel: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});
