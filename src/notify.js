// Local (on-device) reminders for expiring documents. Nothing is sent to a server.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { parseISO, fmtDate } from "./util";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function askPermission() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("expiry", { name: "Document expiry", importance: Notifications.AndroidImportance.DEFAULT });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch (e) { return false; }
}

/** Replace all scheduled reminders with fresh ones: 90 and 30 days before, and on the day, at 9:00. */
export async function scheduleExpiryAlerts(docs) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = Date.now(); let count = 0;
    for (const d of docs) {
      const exp = parseISO(d.expires); if (!exp) continue;
      for (const before of [90, 30, 0]) {
        const at = new Date(exp); at.setDate(at.getDate() - before); at.setHours(9, 0, 0, 0);
        if (at.getTime() <= now) continue;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: before ? `${d.title} expires in ${before} days` : `${d.title} expires today`,
            body: before ? `Expiry date: ${fmtDate(d.expires)}. Plan your renewal now.` : "Renew it before you submit it anywhere.",
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: "expiry" },
        });
        count++;
      }
    }
    return count;
  } catch (e) { return -1; }
}

export async function cancelAlerts() { try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch (e) {} }
