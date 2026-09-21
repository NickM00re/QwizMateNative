import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { PickedFile } from "../types";

const NOTES_DIR = `${FileSystem.documentDirectory}notes/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(NOTES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(NOTES_DIR, { intermediates: true });
  }
}

// Copies a picked file into this app's own document storage so it survives
// app restarts (picker results otherwise live in a temp/cache location the
// OS can clear). On web there's no such persistent filesystem to copy into —
// the picker's blob: URL is kept alive by the browser for the page's
// lifetime, which is enough to use it, but it won't survive a page reload.
export async function persistPickedFile(noteId: string, file: PickedFile): Promise<string> {
  if (Platform.OS === "web") {
    return file.uri;
  }
  await ensureDir();
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot) : "";
  const dest = `${NOTES_DIR}${noteId}${ext}`;
  await FileSystem.copyAsync({ from: file.uri, to: dest });
  return dest;
}

export async function deletePersistedFile(uri: string): Promise<void> {
  if (Platform.OS === "web" || !uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // best-effort cleanup
  }
}
