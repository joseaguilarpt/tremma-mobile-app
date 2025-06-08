import * as BackgroundFetch from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { getCommunications } from "@/api/communication";
import { getAuthData, isTokenExpired, refreshToken } from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendNotification } from "@/utils/notifications";
import { dayCR } from "@/utils/dates";

export const BACKGROUND_TASK_NAME = "background-fetch-task";

// Configurar el manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,

    shouldShowBanner: true,
    shouldShowList: true,
    shouldShowInForeground: true,
    shouldShowInBackground: true,
    shouldShowInApp: true,
  }),
});

// Definir la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    console.log("Ejecutando tarea en segundo plano...");
    const isExpired = await isTokenExpired();
    if (isExpired) {
      await refreshToken();
    }
    const data = await getAuthData();
    // Comprobar si hay un ID de usuario válido
    if (!data?.user?.id) {
      console.log("No hay user.Id disponible. Saltando la llamada a la API.");
      return BackgroundFetch.BackgroundTaskResult.Failed;
    }

    const response = await getCommunications({ userId: data?.user?.id });
    let messagesList = response.map((item) => ({
      ...item,
      Fecha: item.Fecha,
    }));

    const lastCheck = await AsyncStorage.getItem("last_messages_check");
    if (lastCheck) {
      messagesList = messagesList.filter((item) =>
        dayCR(item.Fecha).isAfter(dayCR(lastCheck))
      );
    }
    sendNotification({
      title: "Arrow",
      body: `Tiene mensajes nuevos.`,
    });
    await AsyncStorage.setItem("last_messages_check", new Date().toISOString());
    return BackgroundFetch.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("Error en la tarea de background:", error);
    return BackgroundFetch.BackgroundTaskResult.Failed;
  }
});
