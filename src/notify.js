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

const TRIAL_ID = "trial-end";

/** Cancel the document reminders but keep the free-trial reminder. */
async function cancelExpiryOnly() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) if (n.identifier !== TRIAL_ID) await Notifications.cancelScheduledNotificationAsync(n.identifier);
}

/** Remind the member 2 days before their free trial turns into a paid subscription (Apple and Google both
 *  recommend this; it cuts refund requests). Safe to call repeatedly: it replaces the previous reminder. */
export async function scheduleTrialReminder(endsISO, priceText) {
  try {
    await Notifications.cancelScheduledNotificationAsync(TRIAL_ID).catch(() => {});
    const end = new Date(endsISO); if (isNaN(end)) return false;
    const at = new Date(end.getTime() - 2 * 86400000);
    if (at.getTime() <= Date.now()) return false;
    if (!(await askPermission())) return false;
    await Notifications.scheduleNotificationAsync({
      identifier: TRIAL_ID,
      content: {
        title: "Your USRN Pathway Pro trial ends in 2 days",
        body: `After ${fmtDate(end.toISOString().slice(0, 10))} it renews at ${priceText}. Keep it, or cancel any time in your store subscriptions.`,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: "expiry" },
    });
    return true;
  } catch (e) { return false; }
}

export async function cancelTrialReminder() { try { await Notifications.cancelScheduledNotificationAsync(TRIAL_ID); } catch (e) {} }

/** Replace all scheduled reminders with fresh ones: 90 and 30 days before, and on the day, at 9:00. */
export async function scheduleExpiryAlerts(docs) {
  try {
    await cancelExpiryOnly();
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

export async function cancelAlerts() { try { await cancelExpiryOnly(); } catch (e) {} }
