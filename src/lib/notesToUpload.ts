// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import { Note } from "../types";
import { UploadableFile } from "./api";

// Splits a project's stored notes into the two shapes the quiz-generation
// API accepts: file notes go up as multipart files, text notes get
// concatenated (each labeled with its title) into one notes_text blob.
export function notesToUpload(notes: Note[]): { files: UploadableFile[]; notesText: string } {
  const files: UploadableFile[] = [];
  const textParts: string[] = [];

  for (const note of notes) {
    if (note.kind === "text") {
      if (note.textContent?.trim()) {
        textParts.push(`## ${note.name}\n${note.textContent}`);
      }
    } else {
      files.push({ uri: note.uri, name: note.name, mimeType: note.mimeType });
    }
  }

  return { files, notesText: textParts.join("\n\n") };
}
