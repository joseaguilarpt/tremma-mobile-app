import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { getCommunications } from "@/api/communication";
import { getAuthData } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

export const BACKGROUND_TASK_NAME = "background-fetch-task";

// Configurar el manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Definir la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    console.log("Ejecutando tarea en segundo plano...");
    const data = await getAuthData();

    // Comprobar si hay un ID de usuario válido
    if (!data?.user?.id) {
      console.log("No hay user.Id disponible. Saltando la llamada a la API.");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const response = await getCommunications({ userId: data?.user?.id });
    let messagesList = response.map((item) => ({
      ...item,
      Fecha: item.Fecha,
    }));

    const lastCheck = await AsyncStorage.getItem("last_messages_check");
    if (lastCheck) {
      messagesList = messagesList.filter((item) =>
        dayjs(item.Fecha).isAfter(dayjs(lastCheck))
      );
    }
    if ((messagesList ?? []).length > 0) {
      // Enviar una notificación local
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Tremma App - Notificaciones",
          body: `Tiene ${messagesList.length} mensajes Nuevos.`,
        },
        trigger: null, // Inmediato
      });
    }
    await AsyncStorage.setItem("last_messages_check", new Date().toISOString());
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Error en la tarea de background:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});
