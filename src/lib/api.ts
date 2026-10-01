// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import { Platform } from "react-native";
import { API_BASE_URL } from "../config";
import { QuizQuestion } from "../types";

export interface UploadableFile {
  uri: string;
  name: string;
  mimeType: string;
}

export interface GenerateQuizParams {
  files: UploadableFile[];
  notesText?: string;
  numQuestions?: number;
  difficulty?: string;
}

export async function generateQuiz({
  files,
  notesText = "",
  numQuestions = 5,
  difficulty = "mixed",
}: GenerateQuizParams): Promise<QuizQuestion[]> {
  const form = new FormData();
  form.append("notes_text", notesText);
  form.append("num_questions", String(numQuestions));
  form.append("difficulty", difficulty);

  for (const f of files) {
    if (Platform.OS === "web") {
      // Blob URLs from pickers (and from previously-persisted web notes)
      // stay valid for the page's lifetime, so they can be re-fetched here
      // without needing to keep the original File object around.
      const blob = await fetch(f.uri).then((r) => r.blob());
      form.append("files", blob, f.name);
    } else {
      // React Native's FormData accepts this {uri, name, type} file-part shape,
      // which doesn't match the DOM FormData/Blob types TypeScript expects here.
      // @ts-expect-error
      form.append("files", { uri: f.uri, name: f.name, type: f.mimeType });
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
      method: "POST",
      body: form,
    });
  } catch {
    throw new Error(
      `Couldn't reach the quiz server at ${API_BASE_URL}. Is it running? See server/README.md.`
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.detail || `Server error (${response.status})`);
  }
  return body.questions as QuizQuestion[];
}
