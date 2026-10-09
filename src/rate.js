// Ask for an App Store / Google Play rating at a good moment (after a strong benchmark or a finished phase).
// Uses the system rating prompt (expo-store-review). The stores also limit how often it can appear.
// If the native module isn't in this build yet, this quietly does nothing.
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "usrn.rate.v1";
const GAP_DAYS = 120;

export async function maybeAskForRating() {
  try {
    const last = Number(await AsyncStorage.getItem(KEY)) || 0;
    if (Date.now() - last < GAP_DAYS * 86400000) return false;
    // Loaded lazily so a build without the native module can't crash at startup.
    const StoreReview = require("expo-store-review");
    if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return false;
    await AsyncStorage.setItem(KEY, String(Date.now()));
    await StoreReview.requestReview();
    return true;
  } catch (e) { return false; }
}
