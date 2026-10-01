// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Note, PickedFile } from "../types";

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

// Opens a file note for viewing. On web, PDFs and images open in a new tab
// and other files (Word, PowerPoint) download under their note name. On
// native there's no in-app viewer for Office files, so this opens the share
// sheet, which offers a Quick Look preview and "Open in" Word/Pages/Files.
export async function openNoteFile(note: Note): Promise<void> {
  if (Platform.OS === "web") {
    let blob: Blob;
    try {
      blob = await fetch(note.uri).then((r) => r.blob());
    } catch {
      // Picker blob: URLs don't survive a page reload (see persistPickedFile).
      throw new Error("This file is no longer available. Remove it and add it again.");
    }
    const url = URL.createObjectURL(blob);
    if (note.kind === "pdf" || note.kind === "image") {
      window.open(url, "_blank");
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = note.name;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Opening files isn't supported on this device.");
  }
  await Sharing.shareAsync(note.uri, { mimeType: note.mimeType, dialogTitle: note.name });
}
