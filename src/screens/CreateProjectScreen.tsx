// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, BookOpen } from "lucide-react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function CreateProjectScreen({
  onCreate,
  onCancel,
  firstProject,
}: {
  onCreate: (input: { name: string; course: string }) => void;
  onCancel?: () => void;
  firstProject: boolean;
}) {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim()) {
      setError("Give this course a name, e.g. \"Organic Chemistry\".");
      return;
    }
    setError(null);
    onCreate({ name: name.trim(), course: course.trim() || "—" });
  }

  return (
    <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {onCancel && (
            <Pressable style={styles.backRow} onPress={onCancel} hitSlop={8}>
              <ArrowLeft size={15} color="rgba(255,255,255,0.75)" />
              <Text style={styles.backText}>Cancel</Text>
            </Pressable>
          )}
          <View style={styles.logoBadge}>
            <BookOpen size={26} color={colors.white} />
          </View>
          <Text style={styles.title}>
            {firstProject ? "Create Your First Course" : "New Course"}
          </Text>
          <Text style={styles.subtitle}>
            {firstProject
              ? "Add a course to start uploading notes and generating quizzes"
              : "Add another course to keep its notes and quizzes separate"}
          </Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.field}>
            <Text style={styles.label}>Course Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Organic Chemistry"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Course Code (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CHEM 301"
              placeholderTextColor={colors.mutedForeground}
              value={course}
              onChangeText={setCourse}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={handleSubmit}>
            <LinearGradient
              colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitBtn}
            >
              <Text style={styles.submitBtnText}>Create Course</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  scrollContent: { flexGrow: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backRow: {
    position: "absolute",
    top: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: { color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: fonts.body },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { color: colors.white, fontSize: 22, fontFamily: fonts.displayBold, textAlign: "center" },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: fonts.body,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  body: { paddingHorizontal: 24, paddingTop: 28, gap: 16 },
  field: { gap: 6 },
  label: { color: colors.foreground, fontSize: 13, fontFamily: fonts.bodySemibold },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.foreground,
    fontSize: 14,
    fontFamily: fonts.body,
  },
  error: { color: colors.destructive, fontSize: 12, fontFamily: fonts.bodyMedium },
  submitBtn: {
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.displaySemibold },
});
