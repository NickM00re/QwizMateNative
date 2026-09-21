import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Zap,
  Target,
  Plus,
  ChevronRight,
  FileText,
  Upload,
  Brain,
  Image as ImageIcon,
  X,
  Pencil,
  Trash2,
  Check,
} from "lucide-react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";
import ScoreBadge from "../components/ScoreBadge";
import { generateQuiz } from "../lib/api";
import { notesToUpload } from "../lib/notesToUpload";
import { Note, QuizQuestion } from "../types";
import { useAppData } from "../context/AppDataContext";
import { pluralize } from "../lib/pluralize";
import CreateProjectScreen from "./CreateProjectScreen";

export default function ProjectsScreen({
  selectedId,
  onSelect,
  onBack,
  onStartQuiz,
  onProjectCreated,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onStartQuiz: (questions: QuizQuestion[], projectId: string) => void;
  onProjectCreated: (wasFirst: boolean) => void;
}) {
  const { projects, notesForProject, projectStats, createProject, addTextNote, addFileNote, updateNote, removeNote } =
    useAppData();

  const [creating, setCreating] = useState(projects.length === 0);
  const [addingText, setAddingText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editDraftName, setEditDraftName] = useState("");
  const [editDraftText, setEditDraftText] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const project = selectedId ? projects.find((p) => p.id === selectedId) ?? null : null;

  useEffect(() => {
    setAddingText("");
    setGenError(null);
    setExpandedNoteId(null);
    setEditingNoteId(null);
    setConfirmDeleteId(null);
  }, [selectedId]);

  useEffect(() => {
    if (projects.length === 0 && !selectedId) setCreating(true);
  }, [projects.length, selectedId]);

  async function handleCreateProject(input: { name: string; course: string }) {
    const wasFirst = projects.length === 0;
    const created = await createProject(input);
    setCreating(false);
    onSelect(created.id);
    onProjectCreated(wasFirst);
  }

  if (creating) {
    return (
      <CreateProjectScreen
        firstProject={projects.length === 0}
        onCreate={handleCreateProject}
        onCancel={projects.length > 0 ? () => setCreating(false) : undefined}
      />
    );
  }

  async function handlePickDocument() {
    if (!project) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
      ],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    setGenError(null);
    for (const asset of result.assets) {
      await addFileNote(project.id, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
      });
    }
  }

  async function handlePickPhotos() {
    if (!project) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setGenError("Photo library access is needed to add note photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    setGenError(null);
    for (let i = 0; i < result.assets.length; i++) {
      const asset = result.assets[i];
      await addFileNote(project.id, {
        uri: asset.uri,
        name: asset.fileName ?? `note-photo-${Date.now()}-${i}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    }
  }

  async function handleAddTextNote() {
    if (!project || !addingText.trim()) return;
    const textNoteCount = notesForProject(project.id).filter((n) => n.kind === "text").length;
    await addTextNote(project.id, `Text Note ${textNoteCount + 1}`, addingText.trim());
    setAddingText("");
  }

  function startEdit(note: Note) {
    setConfirmDeleteId(null);
    setEditingNoteId(note.id);
    setEditDraftName(note.name);
    setEditDraftText(note.textContent ?? "");
  }

  async function saveEdit() {
    if (!editingNoteId) return;
    await updateNote(editingNoteId, {
      name: editDraftName.trim() || "Untitled",
      textContent: editDraftText,
    });
    setEditingNoteId(null);
  }

  async function handleDelete(id: string) {
    await removeNote(id);
    setConfirmDeleteId(null);
    if (expandedNoteId === id) setExpandedNoteId(null);
  }

  async function handleGenerate() {
    if (!project) return;
    const { files, notesText } = notesToUpload(notesForProject(project.id));
    if (files.length === 0 && !notesText.trim()) {
      setGenError("Add at least one note (photo, document, or text) first.");
      return;
    }
    setGenerating(true);
    setGenError(null);
    try {
      const questions = await generateQuiz({ files, notesText, numQuestions: 5, difficulty: "mixed" });
      onStartQuiz(questions, project.id);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Something went wrong generating the quiz.");
    } finally {
      setGenerating(false);
    }
  }

  if (project) {
    const stats = projectStats(project.id);
    const notes = notesForProject(project.id);

    return (
      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 16 }}>
        <LinearGradient
          colors={[project.color, project.color + "bb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.detailHeader}
        >
          <Pressable style={styles.backRow} onPress={onBack}>
            <ArrowLeft size={15} color="rgba(255,255,255,0.75)" />
            <Text style={styles.backText}>All Projects</Text>
          </Pressable>
          <Text style={styles.detailName}>{project.name}</Text>
          <Text style={styles.detailCourse}>{project.course}</Text>
          <View style={styles.detailStatsRow}>
            {[
              { v: String(stats.noteCount), l: "Notes" },
              { v: String(stats.quizCount), l: "Quizzes" },
              { v: stats.lastScore !== null ? `${stats.lastScore}%` : "—", l: "Last Score" },
            ].map(({ v, l }) => (
              <View key={l}>
                <Text style={styles.detailStatValue}>{v}</Text>
                <Text style={styles.detailStatLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.detailBody}>
          <Pressable onPress={handleGenerate} disabled={generating}>
            <LinearGradient
              colors={[project.color, project.color + "bb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            >
              {generating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Zap size={17} color={colors.white} />
              )}
              <Text style={styles.generateBtnText}>
                {generating ? "Generating Quiz…" : "Generate Quiz from My Notes"}
              </Text>
            </LinearGradient>
          </Pressable>

          {stats.weakTopics.length > 0 && (
            <View style={styles.focusCard}>
              <View style={styles.focusHeader}>
                <Target size={13} color={colors.amber600} />
                <Text style={styles.focusTitle}>Focus Topics</Text>
              </View>
              <View style={styles.focusChips}>
                {stats.weakTopics.map((t) => (
                  <View key={t} style={styles.focusChip}>
                    <Text style={styles.focusChipText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.addNotesCard}>
            <Text style={styles.sectionTitle}>Study Notes</Text>
            <Text style={styles.addNotesSubtitle}>
              Handwritten photos, PDFs, slides, or pasted text — the quiz above is generated
              from everything in this list.
            </Text>

            <View style={styles.addNotesActions}>
              <Pressable style={styles.addNotesBtn} onPress={handlePickPhotos}>
                <ImageIcon size={15} color={colors.primary} />
                <Text style={styles.addNotesBtnText}>Add Photos</Text>
              </Pressable>
              <Pressable style={styles.addNotesBtn} onPress={handlePickDocument}>
                <Upload size={15} color={colors.primary} />
                <Text style={styles.addNotesBtnText}>Add Document</Text>
              </Pressable>
            </View>

            <View style={styles.addTextRow}>
              <TextInput
                style={styles.notesInput}
                placeholder="Or paste/type notes text, then Add…"
                placeholderTextColor={colors.mutedForeground}
                multiline
                value={addingText}
                onChangeText={setAddingText}
              />
              <Pressable
                style={[styles.addTextBtn, !addingText.trim() && styles.addTextBtnDisabled]}
                onPress={handleAddTextNote}
                disabled={!addingText.trim()}
              >
                <Plus size={14} color={colors.white} />
                <Text style={styles.addTextBtnText}>Add Text Note</Text>
              </Pressable>
            </View>

            {genError && <Text style={styles.errorText}>{genError}</Text>}

            {notes.length === 0 ? (
              <Text style={styles.emptyNotesText}>No notes yet — add one above.</Text>
            ) : (
              <View style={{ gap: 8, marginTop: 12 }}>
                {notes.map((note) => {
                  const isEditing = editingNoteId === note.id;
                  const isExpanded = expandedNoteId === note.id;
                  const isConfirmingDelete = confirmDeleteId === note.id;

                  if (isEditing) {
                    return (
                      <View key={note.id} style={styles.noteEditCard}>
                        <TextInput
                          style={styles.editNameInput}
                          value={editDraftName}
                          onChangeText={setEditDraftName}
                          placeholder="Note name"
                          placeholderTextColor={colors.mutedForeground}
                        />
                        {note.kind === "text" && (
                          <TextInput
                            style={styles.notesInput}
                            value={editDraftText}
                            onChangeText={setEditDraftText}
                            multiline
                            placeholder="Note text"
                            placeholderTextColor={colors.mutedForeground}
                          />
                        )}
                        <View style={styles.editActionsRow}>
                          <Pressable style={styles.editCancelBtn} onPress={() => setEditingNoteId(null)}>
                            <Text style={styles.editCancelBtnText}>Cancel</Text>
                          </Pressable>
                          <Pressable style={styles.editSaveBtn} onPress={saveEdit}>
                            <Check size={13} color={colors.white} />
                            <Text style={styles.editSaveBtnText}>Save</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View key={note.id} style={styles.noteCard}>
                      <Pressable
                        style={styles.noteRow}
                        onPress={() => setExpandedNoteId(isExpanded ? null : note.id)}
                      >
                        <View style={[styles.noteIcon, { backgroundColor: project.bg }]}>
                          <FileText size={15} color={project.color} />
                        </View>
                        <View style={styles.flexShrink}>
                          <Text style={styles.noteTitle} numberOfLines={1}>
                            {note.name}
                          </Text>
                          <Text style={styles.noteMeta}>
                            {new Date(note.createdAt).toLocaleDateString()} · {note.kind}
                          </Text>
                        </View>
                        <Pressable onPress={() => startEdit(note)} hitSlop={8} style={styles.iconBtn}>
                          <Pencil size={14} color={colors.mutedForeground} />
                        </Pressable>
                        <Pressable
                          onPress={() => setConfirmDeleteId(note.id)}
                          hitSlop={8}
                          style={styles.iconBtn}
                        >
                          <Trash2 size={14} color={colors.destructive} />
                        </Pressable>
                      </Pressable>

                      {isConfirmingDelete && (
                        <View style={styles.confirmRow}>
                          <Text style={styles.confirmText}>Delete this note?</Text>
                          <Pressable onPress={() => setConfirmDeleteId(null)}>
                            <Text style={styles.confirmCancel}>Cancel</Text>
                          </Pressable>
                          <Pressable onPress={() => handleDelete(note.id)}>
                            <Text style={styles.confirmDelete}>Delete</Text>
                          </Pressable>
                        </View>
                      )}

                      {isExpanded && !isConfirmingDelete && (
                        <View style={styles.noteExpanded}>
                          {note.kind === "text" && (
                            <Text style={styles.noteExpandedText}>{note.textContent}</Text>
                          )}
                          {note.kind === "image" && (
                            <Image source={{ uri: note.uri }} style={styles.notePreviewImage} resizeMode="cover" />
                          )}
                          {(note.kind === "pdf" || note.kind === "pptx") && (
                            <Text style={styles.noteExpandedMeta}>
                              {note.kind.toUpperCase()} file — included when you generate a quiz.
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 16 }}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>My Projects</Text>
        <Text style={styles.listSubtitle}>Tap a course to view notes and start a quiz</Text>
      </View>

      <View style={styles.listBody}>
        {projects.map((p) => {
          const stats = projectStats(p.id);
          return (
            <Pressable key={p.id} style={styles.projectCard} onPress={() => onSelect(p.id)}>
              <View style={styles.projectCardRow}>
                <View style={[styles.stripe, { backgroundColor: p.color }]} />
                <View style={styles.flexShrink}>
                  <View style={styles.projectCardTop}>
                    <View style={styles.flexShrink}>
                      <Text style={[styles.courseCode, { color: p.color }]}>{p.course}</Text>
                      <Text style={styles.projectName}>{p.name}</Text>
                    </View>
                    <ScoreBadge score={stats.lastScore} />
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <FileText size={10} color={colors.mutedForeground} />
                      <Text style={styles.metaText}>{pluralize(stats.noteCount, "note")}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Brain size={10} color={colors.mutedForeground} />
                      <Text style={styles.metaText}>{pluralize(stats.quizCount, "quiz", "quizzes")}</Text>
                    </View>
                    {stats.weakTopics.length > 0 && (
                      <View style={styles.metaItem}>
                        <Target size={10} color="#f59e0b" />
                        <Text style={[styles.metaText, { color: "#f59e0b" }]}>
                          {stats.weakTopics.length} weak
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <ChevronRight size={15} color={colors.mutedForeground} />
              </View>
            </Pressable>
          );
        })}

        <Pressable style={styles.newProjectCard} onPress={() => setCreating(true)}>
          <View style={styles.newProjectIcon}>
            <Plus size={17} color={colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>New Study Project</Text>
          <Text style={styles.uploadSubtitle}>Add a course to get started</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  flexShrink: { flex: 1, minWidth: 0 },
  stripe: { width: 4, alignSelf: "stretch", borderRadius: 999 },
  sectionTitle: { color: colors.foreground, fontSize: 17, fontFamily: fonts.displaySemibold },

  // Detail view
  detailHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: fonts.body },
  detailName: { color: colors.white, fontSize: 24, fontFamily: fonts.displayBold, marginBottom: 2 },
  detailCourse: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: fonts.mono },
  detailStatsRow: { flexDirection: "row", gap: 20, marginTop: 16 },
  detailStatValue: { color: colors.white, fontSize: 20, fontFamily: fonts.displayBold },
  detailStatLabel: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: fonts.body },
  detailBody: { paddingHorizontal: 20, marginTop: 16, gap: 16 },
  generateBtn: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generateBtnText: { color: colors.white, fontSize: 17, fontFamily: fonts.displaySemibold },
  generateBtnDisabled: { opacity: 0.75 },
  focusCard: {
    backgroundColor: colors.amber50,
    borderWidth: 1,
    borderColor: colors.amber200,
    borderRadius: radius.lg,
    padding: 16,
  },
  focusHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  focusTitle: { color: colors.amber700, fontSize: 14, fontFamily: fonts.bodySemibold },
  focusChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  focusChip: {
    backgroundColor: colors.amber100,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  focusChipText: { color: colors.amber700, fontSize: 12, fontFamily: fonts.bodyMedium },

  addNotesCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  addNotesSubtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 4,
    marginBottom: 12,
  },
  addNotesActions: { flexDirection: "row", gap: 8, marginBottom: 12 },
  addNotesBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  addNotesBtnText: { color: colors.primary, fontSize: 13, fontFamily: fonts.bodySemibold },
  addTextRow: { gap: 8 },
  addTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 10,
  },
  addTextBtnDisabled: { opacity: 0.5 },
  addTextBtnText: { color: colors.white, fontSize: 13, fontFamily: fonts.bodySemibold },
  errorText: { color: colors.destructive, fontSize: 12, fontFamily: fonts.bodyMedium, marginTop: 8 },
  emptyNotesText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 12,
  },
  notesInput: {
    minHeight: 64,
    backgroundColor: colors.muted,
    borderRadius: radius.md,
    padding: 12,
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fonts.body,
    textAlignVertical: "top",
  },
  noteCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  noteRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  noteIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  noteTitle: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bodyMedium },
  noteMeta: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
    fontFamily: fonts.body,
    textTransform: "capitalize",
  },
  iconBtn: { padding: 4 },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  confirmText: { flex: 1, color: colors.foreground, fontSize: 12, fontFamily: fonts.body },
  confirmCancel: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.bodySemibold },
  confirmDelete: { color: colors.destructive, fontSize: 12, fontFamily: fonts.bodySemibold },
  noteExpanded: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  noteExpandedText: { color: colors.foreground, fontSize: 13, fontFamily: fonts.body, lineHeight: 19 },
  noteExpandedMeta: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body },
  notePreviewImage: { width: "100%", height: 160, borderRadius: 8 },
  noteEditCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  editNameInput: {
    backgroundColor: colors.muted,
    borderRadius: radius.sm,
    padding: 10,
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fonts.bodyMedium,
  },
  editActionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  editCancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  editCancelBtnText: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.bodySemibold },
  editSaveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editSaveBtnText: { color: colors.white, fontSize: 13, fontFamily: fonts.bodySemibold },

  uploadTitle: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bodySemibold },
  uploadSubtitle: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body, textAlign: "center" },

  // List view
  listHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  listTitle: { color: colors.foreground, fontSize: 24, fontFamily: fonts.displayBold, marginBottom: 4 },
  listSubtitle: { color: colors.mutedForeground, fontSize: 14, fontFamily: fonts.body },
  listBody: { paddingHorizontal: 20, gap: 10 },
  projectCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  projectCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  projectCardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 },
  courseCode: { fontSize: 12, fontFamily: fonts.monoMedium, letterSpacing: 0.5 },
  projectName: { color: colors.foreground, fontSize: 17, fontFamily: fonts.displaySemibold },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body },
  newProjectCard: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  newProjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
});
