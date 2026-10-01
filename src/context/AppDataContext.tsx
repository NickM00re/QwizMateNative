// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import React, { createContext, useContext, useEffect, useState } from "react";
import { Note, NoteKind, PickedFile, Project, QuizAttempt, QuizQuestion } from "../types";
import { readJSON, writeJSON } from "../lib/storage";
import { persistPickedFile, deletePersistedFile } from "../lib/notesFileStore";
import { PROJECT_COLOR_PRESETS } from "../theme/colors";

const PROJECTS_KEY = "qwizmate.data.projects";
const NOTES_KEY = "qwizmate.data.notes";
const ATTEMPTS_KEY = "qwizmate.data.attempts";

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// Pickers don't always report a useful MIME type for Office files (web and
// some Android devices send application/octet-stream), so the file extension
// is checked too. "text" is reserved for pasted notes, which carry their
// content in textContent; any other picked file is uploaded as-is.
function noteKindFor(mimeType: string, name: string): NoteKind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf" || ext === "pdf") return "pdf";
  if (mimeType.includes("presentation") || ext === "pptx") return "pptx";
  if (mimeType.includes("wordprocessingml") || ext === "docx") return "docx";
  return "file";
}

export interface ProjectStats {
  noteCount: number;
  quizCount: number;
  lastScore: number | null;
  weakTopics: string[];
}

export interface OverallStats {
  totalQuizzes: number;
  totalQuestions: number;
  avgScore: number;
  totalNotes: number;
  streakDays: number;
  trend: { wk: string; score: number }[];
  topicScores: { topic: string; score: number }[];
}

interface AppDataContextValue {
  ready: boolean;
  projects: Project[];
  notes: Note[];
  attempts: QuizAttempt[];
  createProject: (input: { name: string; course: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  addTextNote: (projectId: string, name: string, text: string) => Promise<Note>;
  addFileNote: (projectId: string, file: PickedFile) => Promise<Note>;
  updateNote: (id: string, patch: { name?: string; textContent?: string }) => Promise<void>;
  replaceNoteFile: (id: string, file: PickedFile) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  recordAttempt: (
    projectId: string,
    questions: QuizQuestion[],
    answers: (number | null)[]
  ) => Promise<QuizAttempt>;
  deleteAttempt: (id: string) => Promise<void>;
  notesForProject: (projectId: string) => Note[];
  attemptsForProject: (projectId: string) => QuizAttempt[];
  projectStats: (projectId: string) => ProjectStats;
  overallStats: () => OverallStats;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function computeTopicScores(attempts: QuizAttempt[]): { topic: string; score: number }[] {
  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    attempt.questions.forEach((q, i) => {
      const s = byTopic.get(q.topic) ?? { correct: 0, total: 0 };
      s.total += 1;
      if (attempt.answers[i] === q.correct) s.correct += 1;
      byTopic.set(q.topic, s);
    });
  }
  return Array.from(byTopic.entries()).map(([topic, s]) => ({
    topic,
    score: Math.round((s.correct / s.total) * 100),
  }));
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    (async () => {
      const [p, n, a] = await Promise.all([
        readJSON<Project[]>(PROJECTS_KEY, []),
        readJSON<Note[]>(NOTES_KEY, []),
        readJSON<QuizAttempt[]>(ATTEMPTS_KEY, []),
      ]);
      setProjects(p);
      setNotes(n);
      setAttempts(a);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) writeJSON(PROJECTS_KEY, projects);
  }, [projects, ready]);
  useEffect(() => {
    if (ready) writeJSON(NOTES_KEY, notes);
  }, [notes, ready]);
  useEffect(() => {
    if (ready) writeJSON(ATTEMPTS_KEY, attempts);
  }, [attempts, ready]);

  async function createProject({ name, course }: { name: string; course: string }): Promise<Project> {
    const preset = PROJECT_COLOR_PRESETS[projects.length % PROJECT_COLOR_PRESETS.length];
    const project: Project = {
      id: makeId("proj"),
      name,
      course,
      color: preset.color,
      bg: preset.bg,
      createdAt: Date.now(),
    };
    setProjects((prev) => [...prev, project]);
    return project;
  }

  async function deleteProject(id: string): Promise<void> {
    const notesToRemove = notes.filter((n) => n.projectId === id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setNotes((prev) => prev.filter((n) => n.projectId !== id));
    setAttempts((prev) => prev.filter((a) => a.projectId !== id));
    for (const n of notesToRemove) await deletePersistedFile(n.uri);
  }

  async function addTextNote(projectId: string, name: string, text: string): Promise<Note> {
    const note: Note = {
      id: makeId("note"),
      projectId,
      kind: "text",
      name,
      mimeType: "text/plain",
      uri: "",
      textContent: text,
      createdAt: Date.now(),
    };
    setNotes((prev) => [...prev, note]);
    return note;
  }

  async function addFileNote(projectId: string, file: PickedFile): Promise<Note> {
    const id = makeId("note");
    const persistedUri = await persistPickedFile(id, file);
    const note: Note = {
      id,
      projectId,
      kind: noteKindFor(file.mimeType, file.name),
      name: file.name,
      mimeType: file.mimeType,
      uri: persistedUri,
      createdAt: Date.now(),
    };
    setNotes((prev) => [...prev, note]);
    return note;
  }

  async function updateNote(id: string, patch: { name?: string; textContent?: string }): Promise<void> {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  }

  // Swaps the file behind an existing note (e.g. after editing it in another
  // app) while keeping its id and name, so the note stays where it was.
  async function replaceNoteFile(id: string, file: PickedFile): Promise<void> {
    const old = notes.find((n) => n.id === id);
    if (!old) return;
    // Persist under a fresh filename: on native, copying onto the old path
    // fails when the extension is unchanged.
    const persistedUri = await persistPickedFile(`${id}_${Date.now()}`, file);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, kind: noteKindFor(file.mimeType, file.name), mimeType: file.mimeType, uri: persistedUri }
          : n
      )
    );
    await deletePersistedFile(old.uri);
  }

  async function removeNote(id: string): Promise<void> {
    const note = notes.find((n) => n.id === id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (note) await deletePersistedFile(note.uri);
  }

  async function recordAttempt(
    projectId: string,
    questions: QuizQuestion[],
    answers: (number | null)[]
  ): Promise<QuizAttempt> {
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    const scorePct = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    const attempt: QuizAttempt = {
      id: makeId("attempt"),
      projectId,
      questions,
      answers,
      scorePct,
      createdAt: Date.now(),
    };
    setAttempts((prev) => [...prev, attempt]);
    return attempt;
  }

  async function deleteAttempt(id: string): Promise<void> {
    setAttempts((prev) => prev.filter((a) => a.id !== id));
  }

  function notesForProject(projectId: string): Note[] {
    return notes.filter((n) => n.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt);
  }

  function attemptsForProject(projectId: string): QuizAttempt[] {
    return attempts.filter((a) => a.projectId === projectId).sort((a, b) => a.createdAt - b.createdAt);
  }

  function projectStats(projectId: string): ProjectStats {
    const pNotes = notesForProject(projectId);
    const pAttempts = attemptsForProject(projectId);
    const lastScore = pAttempts.length > 0 ? pAttempts[pAttempts.length - 1].scorePct : null;
    const weakTopics = computeTopicScores(pAttempts)
      .filter((t) => t.score < 75)
      .sort((a, b) => a.score - b.score)
      .map((t) => t.topic)
      .slice(0, 3);
    return { noteCount: pNotes.length, quizCount: pAttempts.length, lastScore, weakTopics };
  }

  function overallStats(): OverallStats {
    const sorted = [...attempts].sort((a, b) => a.createdAt - b.createdAt);
    const totalQuizzes = sorted.length;
    const totalQuestions = sorted.reduce((sum, a) => sum + a.questions.length, 0);
    const avgScore =
      totalQuizzes > 0 ? Math.round(sorted.reduce((s, a) => s + a.scorePct, 0) / totalQuizzes) : 0;

    const daySet = new Set(sorted.map((a) => new Date(a.createdAt).toDateString()));
    let streakDays = 0;
    const cursor = new Date();
    while (daySet.has(cursor.toDateString())) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const recent = sorted.slice(-8);
    const trend = recent.map((a, i) => ({
      wk: `Q${sorted.length - recent.length + i + 1}`,
      score: a.scorePct,
    }));

    const topicScores = computeTopicScores(sorted)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { totalQuizzes, totalQuestions, avgScore, totalNotes: notes.length, streakDays, trend, topicScores };
  }

  const value: AppDataContextValue = {
    ready,
    projects,
    notes,
    attempts,
    createProject,
    deleteProject,
    addTextNote,
    addFileNote,
    updateNote,
    replaceNoteFile,
    removeNote,
    recordAttempt,
    deleteAttempt,
    notesForProject,
    attemptsForProject,
    projectStats,
    overallStats,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
