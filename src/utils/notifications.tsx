import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useNotificationSetup() {
  useEffect(() => {
    // Solo en Android: crear un canal de notificaciones
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Pedir permisos (recomendado incluso en Android)
    Notifications.requestPermissionsAsync();
  }, []);
}

export   const sendNotification = async ({ title, body }) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
      },
      trigger: null,
    });
  };
