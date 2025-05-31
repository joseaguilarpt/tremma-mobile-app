import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export const ListItem = ({ title, description, color = 'white' }) => {
  if (!title) return null;
  return (
    <View style={styles.row}>
      <View style={[styles.itemTitle]}>
        <Text style={{ color: color ? color : "" }} variant="labelLarge">
          {title}:
        </Text>
      </View>
      <View style={styles.itemDescription}>
        <Text style={{ color: color ? color : "" }} variant="bodyMedium">
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    marginHorizontal: "auto",
    flexDirection: "row",
    paddingBottom: 1,
  },
  itemTitle: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  itemDescription: {
    flex: 4,
    justifyContent: "center",
    alignItems: "flex-start",
  },
});
