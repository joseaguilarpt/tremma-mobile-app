import {
  deleteConfirmCommunication,
  getCommunicationById,
  postUserMessage,
} from "@/api/communication";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import UserSelect from "@/components/UserSelect";
import { useAuth } from "@/context/auth";
import { useLoading } from "@/context/loading.utils";
import { useNotifications } from "@/context/notification";
import { toLowerCaseKeys } from "@/utils";
import { parseErrors } from "@/utils/errors";
import { useNavigation, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Appbar,
  Button,
  Divider,
  HelperText,
  Text,
  TextInput,
  Title,
} from "react-native-paper";

export default function AddMessage() {
  const navigator = useNavigation();
  const route = useRoute();
  const params = route.params as { id: string };
  const id = params?.id;
  const [selectedUser, setSelectedUser] = useState(null);
  const [errors, setErrors] = React.useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const [sendResponse, setSendResponse] = React.useState(!id);
  const [formState, setFormState] = React.useState({
    receiver: "",
    message: "",
    subject: "",
  });

  const [receivedMessage, setReceivedMessage] = React.useState({
    sender: "",
    message: "",
    subject: "",
    date: "",
    id: "",
  });

  const { receiver, message, subject } = formState;
  const { showSnackbar, getMessages } = useNotifications();
  const { setLoading, isLoading } = useLoading();
  const { user } = useAuth();

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleGetData = async () => {
    setLoading(true);
    try {
      const data = await getCommunicationById(id);
      setReceivedMessage({
        ...data,
        sender: `${data.UserEnvia.Nombre} ${data.UserEnvia.Apellido1}`,
        message: data.Descripcion,
        subject: data.Asunto,
        date: dayjs(data.Fecha).format("D MMM YYYY"),
        id: data.Id,
      });
      setFormState({
        receiver: data?.UserEnvia,
        subject: data?.Asunto,
      });
    } catch {
      showSnackbar(
        "Error al cargar los datos del provincia. Por favor, intenta nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await deleteConfirmCommunication(receivedMessage?.id);
      await getMessages();
      showSnackbar("Mensaje confirmado exitosamente.", "success");
      setTimeout(() => {
        navigator.navigate("Messages");
      }, 500);
    } catch (err) {
      const errorMessage = parseErrors(err?.response?.data);
      let message =
        "Error al confirmar el mensaje. Por favor, intenta nuevamente.";

      if (errorMessage.length > 0) {
        message = errorMessage[0];
      }
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const validateErrors = async () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!message) {
      newErrors.message = "El campo Mensaje es obligatorio.";
    }

    if (message && message.length > 60) {
      newErrors.message =
        "El campo Mensaje no puede tener mas de 60 caracteres.";
    }

    if (!receiver) {
      newErrors.receiver = "El campo del Destinatario es obligatorio.";
    }
    if (!subject) {
      newErrors.subject = "El campo Asunto es obligatorio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const handleSave = async () => {
    setLoading(true);
    const errors = await validateErrors();
    if (!errors) {
      try {
        const payload: any = {
          userEnvia: toLowerCaseKeys(user.original),
          userRecibe: toLowerCaseKeys(receiver),
          asunto: subject,
          fecha: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          descripcion: message,
          confirmado: false,
        };

        const api = postUserMessage;
        await api(payload);
        showSnackbar("Mensaje enviado exitosamente.", "success");
        setTimeout(() => {
          navigator.navigate("Messages");
        }, 500);
      } catch (err) {
        const errorMessage = parseErrors(err?.response?.data);
        let message =
          "Error al guardar el mensaje. Por favor, intenta nuevamente.";

        if (errorMessage.length > 0) {
          message = errorMessage[0];
        }
        showSnackbar(message, "error");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      handleGetData();
    }
  }, []);

  return (
    <ProtectedRoute>
      <ScrollView>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View>
            <Appbar.Header>
              <Appbar.BackAction
                onPress={() => navigator.navigate("Messages")}
              />
              <Appbar.Content title={id ? "Ver Mensaje" : "Nuevo Mensaje"} />
            </Appbar.Header>
            <View style={styles.container}>
              {!id && (
                <UserSelect
                  error={!!errors.receiver}
                  helperText={errors.receiver}
                  name="receiver"
                  label="Enviar a:"
                  onChange={handleInputChange}
                />
              )}
              {id && (
                <View>
                  <Title style={{ marginBottom: 10, fontWeight: "bold" }}>
                    Asunto: {receivedMessage?.subject}
                  </Title>
                  <Text style={styles.bold}>Enviado por:</Text>
                  <Text style={{ marginBottom: 10 }}>
                    {receivedMessage?.sender ?? "-"}
                  </Text>
                  <Text style={styles.bold}>Fecha de envío:</Text>
                  <Text style={{ marginBottom: 10 }}>
                    {receivedMessage?.date ?? "-"}
                  </Text>
                  <Divider style={{ marginVertical: 16 }} />
                  <Text style={[styles.bold]}>Mensaje:</Text>
                  <Text variant="bodyLarge">
                    {receivedMessage?.message ?? "-"}
                  </Text>
                  <Divider style={{ marginVertical: 16 }} />
                  {!sendResponse && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        onPress={handleConfirm}
                        disabled={isLoading}
                        style={{ marginRight: 10 }}
                      >
                        Confirmar
                      </Button>
                      <Button
                        disabled={isLoading}
                        onPress={() => setSendResponse(true)}
                        mode="contained"
                      >
                        Responder
                      </Button>
                    </View>
                  )}
                </View>
              )}
              {sendResponse && (
                <View style={{ marginTop: 20 }}>
                  {id && (
                    <Title style={{ marginBottom: 10, fontWeight: "bold" }}>
                      Responder:
                    </Title>
                  )}
                  <TextInput
                    mode="outlined"
                    label={"Asunto"}
                    error={errors["subject"]}
                    onChangeText={(e) => handleInputChange("subject", e)}
                  />
                  {errors["subject"] && (
                    <HelperText type="error" visible={errors["subject"]}>
                      {errors["subject"]}
                    </HelperText>
                  )}
                  <TextInput
                    onChangeText={(e) => handleInputChange("message", e)}
                    multiline={true}
                    numberOfLines={3}
                    style={{
                      marginTop: 10,
                      height: 100, // Ajusta la altura manualmente
                    }}
                    error={errors["message"]}
                    mode="outlined"
                    label={"Mensaje"}
                  />
                  {errors["message"] && (
                    <HelperText type="error" visible={errors["message"]}>
                      {errors["message"]}
                    </HelperText>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 20,
                    }}
                  >
                    <Button
                      disabled={isLoading}
                      onPress={() => {
                        setSendResponse(false);
                        setFormState((v) => ({
                          ...v,
                          message: "",
                          subject: "",
                        }));
                      }}
                      style={{ marginRight: 10 }}
                    >
                      Cancelar
                    </Button>
                    {id && (
                      <Button
                        mode="outlined"
                        onPress={handleConfirm}
                        disabled={isLoading}
                        style={{ marginRight: 10 }}
                      >
                        Confirmar
                      </Button>
                    )}
                    <Button
                      onPress={handleSave}
                      disabled={isLoading}
                      mode="contained"
                    >
                      Enviar Mensaje
                    </Button>
                  </View>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  caption: {
    marginBottom: 8,
  },
  bold: {
    fontWeight: "bold",
  },
});
