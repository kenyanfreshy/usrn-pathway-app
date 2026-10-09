// Backup and restore without accounts or a server.
// "Save a backup" opens the phone's share sheet with the nurse's progress as text, so they can keep it in
// Notes, Files, iCloud Drive, Google Drive or email it to themselves. "Restore" accepts that text again
// (pasted). Nothing leaves the phone unless the nurse chooses where to share it.
import { Share } from "react-native";
import { initialState } from "./state";

const HEADER = "NURSEBOUND-BACKUP v1";
const LEGACY = "USRN-PATHWAY-BACKUP v1"; // backups saved before the app was renamed
const KEEP = Object.keys(initialState());

/** The backup text: a header line, then JSON of everything that matters. */
export function makeBackup(state) {
  const data = {};
  KEEP.forEach((k) => { if (state[k] !== undefined) data[k] = state[k]; });
  return `${HEADER}\nCreated ${new Date().toISOString().slice(0, 10)}. Keep this text safe; it holds your progress, dates and document list.\n${JSON.stringify(data)}`;
}

/** Opens the share sheet. Returns true if shared. */
export async function shareBackup(state) {
  try {
    const r = await Share.share({ title: "NurseBound backup", message: makeBackup(state) });
    return r && r.action === Share.sharedAction;
  } catch (e) { return false; }
}

/** Parses pasted backup text. Returns { state } or { error }. */
export function readBackup(text) {
  const raw = String(text || "").trim();
  if (!raw.startsWith(HEADER) && !raw.startsWith(LEGACY)) return { error: "This doesn't look like a NurseBound backup. Paste the whole text, starting with “NURSEBOUND-BACKUP”." };
  const start = raw.indexOf("{"); const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) return { error: "The backup text is incomplete. Paste all of it." };
  let data;
  // Slice to the last "}" so text an email app adds after the backup (a signature, "Sent from my phone") is ignored.
  try { data = JSON.parse(raw.slice(start, end + 1)); } catch (e) { return { error: "The backup text is damaged or cut off. Paste all of it." }; }
  if (!data || typeof data !== "object" || Array.isArray(data)) return { error: "The backup text is damaged." };
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  if (!isObj(data.steps) || !isObj(data.profile)) return { error: "The backup is missing your roadmap or profile." };
  const out = {};
  KEEP.forEach((k) => { if (data[k] !== undefined) out[k] = data[k]; });
  // basic type checks so a bad file can't break the app
  const lists = ["docs", "exams", "ladder", "payments", "catSeen"];
  for (const k of lists) if (out[k] !== undefined && !Array.isArray(out[k])) return { error: "The backup is damaged (" + k + ")." };
  const objs = ["steps", "lessons", "careers", "credit", "drive", "qstats", "srs", "daily", "runs", "days", "qotd", "profile", "plan"];
  for (const k of objs) if (out[k] !== undefined && out[k] !== null && !isObj(out[k])) return { error: "The backup is damaged (" + k + ")." };
  return { state: out };
}
