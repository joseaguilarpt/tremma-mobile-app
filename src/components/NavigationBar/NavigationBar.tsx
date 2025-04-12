import { useAuth } from "@/context/auth";
import { useNotifications } from "@/context/notification";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import {
  Appbar,
  Avatar,
  Badge,
  Button,
  Icon,
  TouchableRipple,
  useTheme,
} from "react-native-paper";

export default function NavigationBar() {
  const theme = useTheme();
  const { imageSrc, user = {} } = useAuth();
  const { messages } = useNotifications()

  const navigator = useNavigation();
  return (
    <Appbar.Header>
      {imageSrc && (
        <Button onPress={() => navigator.navigate("Cuenta")}>
          <Avatar.Image
            style={styles.avatar}
            size={40}
            source={{ uri: imageSrc }}
          />
        </Button>
      )}
      {!imageSrc && (
        <Avatar.Text
          style={styles.avatar}
          size={40}
          label={user?.name?.charAt(0) ?? 'U'}
        />
      )}
      <Appbar.Content title="" />

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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16, // Espaciado lateral para que no quede pegado a los bordes
    paddingTop: 16, // Evita solapamiento con la StatusBar en Android
  },
  divider: {
    margin: 16,
  },
  avatar: {
    marginLeft: 10,
  },
});
