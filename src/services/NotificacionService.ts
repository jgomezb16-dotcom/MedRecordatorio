import { Platform } from "react-native";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { getPermissionsAsync, requestPermissionsAsync } from "expo-notifications/build/NotificationPermissions";
import { setNotificationChannelAsync } from "expo-notifications/build/setNotificationChannelAsync";
import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { Toma } from "../models/Toma";

const MAXIMO_NOTIFICACIONES = 60;
const CANAL = "recordatorios";

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificacionService {
  private async crearCanal(): Promise<string | undefined> {
    if (Platform.OS !== "android") {
      return undefined;
    }
    try {
      await setNotificationChannelAsync(CANAL, {
        name: "Recordatorios de medicamentos",
        importance: AndroidImportance.HIGH,
      });
      return CANAL;
    } catch {
      return undefined;
    }
  }

  async pedirPermiso(): Promise<boolean> {
    const actual = await getPermissionsAsync();
    if (actual.granted) {
      return true;
    }
    const respuesta = await requestPermissionsAsync();
    return respuesta.granted;
  }

  async reprogramar(tomas: Toma[]): Promise<void> {
    try {
      const canal = await this.crearCanal();
      const permitido = await this.pedirPermiso();
      if (!permitido) {
        return;
      }

      await cancelAllScheduledNotificationsAsync();

      const ahora = new Date();
      const futuras = tomas
        .filter((t) => t.estado === "pendiente" && t.fechaHora > ahora)
        .slice(0, MAXIMO_NOTIFICACIONES);

      for (const toma of futuras) {
        await scheduleNotificationAsync({
          content: {
            title: "Hora de tu medicamento 💊",
            body: `${toma.nombreMedicamento} · ${toma.dosis}`,
            sound: true,
          },
          trigger: {
            type: SchedulableTriggerInputTypes.DATE,
            date: toma.fechaHora,
            channelId: canal,
          },
        });
      }
    } catch (e: unknown) {
      console.warn("No se pudieron programar las notificaciones", e);
    }
  }
}