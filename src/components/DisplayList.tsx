import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function DisplayList({
  data,
}: {
  data: { [key: string]: string }[];
}) {
  return (
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
  );
}

const styles = StyleSheet.create({
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
