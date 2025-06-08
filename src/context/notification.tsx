import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { StyleSheet } from "react-native";
import { Snackbar, Banner, Text } from "react-native-paper";
import dayjs from "dayjs";
import { getCommunications } from "../api/communication";
import { useAuth } from "./auth";
import { NotificationContext } from "./notification.utils";

// Create NotificationContext

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalOnConfirm, setModalOnConfirm] = useState<() => void>(() => {});
  const [modalOnCancel, setModalOnCancel] = useState<() => void>(() => {});

  // Messages state
  const [messages, setMessages] = useState([]);
  const { user } = useAuth();

  // Fetch messages for the user
  const checkMessages = async () => {
    try {
      const response = await getCommunications({ userId: user?.id });
      const messagesList = response.map((item) => ({
        ...item,
        Fecha: item.Fecha,
      }));

      setMessages(messagesList ?? []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  // Periodically check for messages if the user is logged in
  useEffect(() => {
    if (user) {
      checkMessages();

      const intervalId = setInterval(() => {
        checkMessages();
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(intervalId);
    }
  }, [user]);

  // Snackbar handlers
  const showSnackbar = (
    msg: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarVisible(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarVisible(false);
  };

  // Modal handlers
  const showAlertModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOnConfirm(() => onConfirm);
    setModalOnCancel(() => onCancel || (() => setModalVisible(false)));
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        showSnackbar,
        showAlertModal,
        messages,
        getMessages: checkMessages,
      }}
    >
      {children}

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={handleSnackbarClose}
        duration={6000}
        style={[
          styles.snackbar,
          snackbarSeverity === "error" && styles.snackbarError,
          snackbarSeverity === "success" && styles.snackbarSuccess,
          { zIndex: 10000 },
        ]}
        action={{
          labelStyle: { color: "white" },
          label: "Cerrar",
          icon: "close",
          onPress: () => handleSnackbarClose(),
        }}
      >
        <Text>{snackbarMessage}</Text>
      </Snackbar>

      {/* Alert Modal */}
      <Banner
        visible={modalVisible}
        actions={[
          {
            label: "Cancelar",
            onPress: () => modalOnCancel(),
          },
          {
            label: "Continuar",
            onPress: () => modalOnConfirm(),
          },
        ]}
      >
        <Text>{modalMessage}</Text>
      </Banner>
    </NotificationContext.Provider>
  );
};

// Custom hook for using NotificationContext
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a SnackbarProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  snackbar: {
    backgroundColor: "#323232", // Default background color for snackbar
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  snackbarError: {
    backgroundColor: "#d32f2f", // Red for error
  },
  snackbarSuccess: {
    backgroundColor: "#388e3c", // Green for success
  },
});
