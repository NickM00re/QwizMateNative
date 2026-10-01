// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

export type Tab = "home" | "projects" | "quiz" | "stats";

export interface Project {
  id: string;
  name: string;
  course: string;
  color: string;
  bg: string;
  createdAt: number;
}

export type NoteKind = "text" | "image" | "pdf" | "pptx" | "docx" | "file";

// A single uploaded/pasted note that belongs to a project. File-backed notes
// (image/pdf/pptx/docx/file) are copied into persistent app storage on native so they
// survive app restarts; on web, `uri` is a session-lived blob URL (see
// src/lib/notesFileStore.ts for why).
export interface Note {
  id: string;
  projectId: string;
  kind: NoteKind;
  name: string;
  mimeType: string;
  uri: string;
  textContent?: string;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

// One completed (or in-progress-and-finished) quiz run, kept so Stats/Home
// can compute real numbers instead of showing fake ones.
export interface QuizAttempt {
  id: string;
  projectId: string;
  questions: QuizQuestion[];
  answers: (number | null)[];
  scorePct: number;
  createdAt: number;
}

// A note file (photo, PDF, slides, etc.) selected via a picker, not yet
// turned into a persisted Note.
export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
}
