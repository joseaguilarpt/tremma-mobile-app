import React, { useEffect } from "react";
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
import { Message } from "@/types/Message";
import { RootStackParamList } from "@/types/Routes";
import { toLowerCaseKeys } from "@/utils";
import { dayCR } from "@/utils/dates";
import { parseErrors } from "@/utils/errors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function AddMessage() {
  const route = useRoute();
  const params = route.params as { id: string };
  const id = params?.id;

  const navigator =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [sendResponse, setSendResponse] = React.useState(!id);
  const [formState, setFormState] = React.useState<Partial<Message>>({
    receiver: "",
    message: "",
    subject: "",
  });
  const [receivedMessage, setReceivedMessage] = React.useState<
    Partial<Message>
  >({
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

  const handleInputChange = (field: keyof Message, value: string) => {
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
        date: dayCR(data.Fecha).format("D MMM YYYY"),
        id: data.Id,
      });
      setFormState({
        receiver: data?.UserEnvia,
        subject: data?.Asunto,
      });
    } catch {
      showSnackbar(
        "Error al cargar los datos del mensaje. Por favor, intenta nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteConfirmCommunication(receivedMessage?.id);
      await getMessages();
      showSnackbar("Mensaje confirmado exitosamente.", "success");
      navigator.navigate("Messages");
    } catch (err) {
      const errorMessage = parseErrors(err?.response?.data);
      showSnackbar(
        errorMessage[0] ||
          "Error al confirmar el mensaje. Por favor, intenta nuevamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const validateErrors = () => {
    const newErrors: { [key: string]: string } = {};

    if (!message) newErrors.message = "El campo Mensaje es obligatorio.";
    if (message && message.length > 60)
      newErrors.message =
        "El campo Mensaje no puede tener más de 60 caracteres.";
    if (!receiver)
      newErrors.receiver = "El campo del Destinatario es obligatorio.";
    if (!subject) newErrors.subject = "El campo Asunto es obligatorio.";

    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  const handleSave = async () => {
    setLoading(true);
    if (!validateErrors()) {
      try {
        const payload = {
          userEnvia: toLowerCaseKeys(user.original),
          userRecibe: toLowerCaseKeys(receiver),
          asunto: subject,
          fecha: dayCR().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          descripcion: message,
          confirmado: false,
        };

        await postUserMessage(payload);
        showSnackbar("Mensaje enviado exitosamente.", "success");
        navigator.navigate("Messages");
      } catch (err) {
        const errorMessage = parseErrors(err?.response?.data);
        showSnackbar(
          errorMessage[0] ||
            "Error al guardar el mensaje. Por favor, intenta nuevamente.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) handleGetData();
  }, [id]);

  return (
    <ProtectedRoute>
      <ScrollView>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Appbar.Header>
              <Appbar.BackAction
                onPress={() => navigator.navigate("Messages")}
              />
              <Appbar.Content title={id ? "Ver Mensaje" : "Nuevo Mensaje"} />
            </Appbar.Header>
            <View style={styles.container}>
              {!id ? (
                <UserSelect
                  disabled={false}
                  error={!!errors.receiver}
                  helperText={errors.receiver}
                  name="receiver"
                  label="Enviar a:"
                  onChange={handleInputChange}
                />
              ) : (
                <MessageDetails
                  receivedMessage={receivedMessage}
                  sendResponse={sendResponse}
                  setSendResponse={setSendResponse}
                  handleConfirm={handleConfirm}
                  isLoading={isLoading}
                />
              )}
              {sendResponse && (
                <MessageForm
                  formState={formState}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  handleSave={handleSave}
                  setSendResponse={setSendResponse}
                  isLoading={isLoading}
                  id={id}
                  handleConfirm={handleConfirm}
                />
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </ProtectedRoute>
  );
}

const MessageDetails = ({
  receivedMessage,
  sendResponse,
  setSendResponse,
  handleConfirm,
  isLoading,
}: {
  receivedMessage: Partial<Message>;
  sendResponse: boolean;
  setSendResponse: React.Dispatch<React.SetStateAction<boolean>>;
  handleConfirm: () => void;
  isLoading: boolean;
}) => (
  <View>
    <Title style={styles.bold}>Asunto: {receivedMessage?.subject}</Title>
    <Text style={styles.bold}>Enviado por:</Text>
    <Text>{receivedMessage?.sender ?? "-"}</Text>
    <Text style={styles.bold}>Fecha de envío:</Text>
    <Text>{receivedMessage?.date ?? "-"}</Text>
    <Divider style={styles.divider} />
    <Text style={styles.bold}>Mensaje:</Text>
    <Text>{receivedMessage?.message ?? "-"}</Text>
    <Divider style={styles.divider} />
    {!sendResponse && (
      <View style={styles.buttonRow}>
        <Button onPress={handleConfirm} disabled={isLoading}>
          Confirmar
        </Button>
        <Button
          onPress={() => setSendResponse(true)}
          mode="contained"
          disabled={isLoading}
        >
          Responder
        </Button>
      </View>
    )}
  </View>
);

const MessageForm = ({
  formState,
  errors,
  handleInputChange,
  handleSave,
  setSendResponse,
  isLoading,
  id,
  handleConfirm,
}: {
  formState: Partial<Message>;
  errors: { [key: string]: string };
  handleInputChange: (field: keyof Message, value: string) => void;
  handleSave: () => void;
  setSendResponse: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  id?: string;
  handleConfirm: () => void;
}) => (
  <View style={styles.form}>
    {id && <Title style={styles.bold}>Responder:</Title>}
    <TextInput
      mode="outlined"
      label="Asunto"
      value={formState.subject}
      error={!!errors.subject}
      onChangeText={(value) => handleInputChange("subject", value)}
    />
    {errors.subject && <HelperText type="error">{errors.subject}</HelperText>}
    <TextInput
      mode="outlined"
      label="Mensaje"
      value={formState.message}
      multiline
      numberOfLines={3}
      style={styles.textArea}
      error={!!errors.message}
      onChangeText={(value) => handleInputChange("message", value)}
    />
    {errors.message && <HelperText type="error">{errors.message}</HelperText>}
    <View style={styles.buttonRow}>
      <Button
        onPress={() => {
          setSendResponse(false);
          handleInputChange("message", "");
          handleInputChange("subject", "");
        }}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      {id && (
        <Button onPress={handleConfirm} mode="outlined" disabled={isLoading}>
          Confirmar
        </Button>
      )}
      <Button onPress={handleSave} mode="contained" disabled={isLoading}>
        Enviar Mensaje
      </Button>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  bold: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  divider: {
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  form: {
    marginTop: 20,
  },
  textArea: {
    marginTop: 10,
    height: 100,
  },
});
