// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, ChevronRight, Sparkles, X } from "lucide-react-native";
import { ANSWER_LABELS, DIFFICULTY_COLORS } from "../constants/quiz";
import { colors, radius, scoreColor } from "../theme/colors";
import { fonts } from "../theme/fonts";
import FadeSwitcher from "../components/FadeSwitcher";
import { QuizQuestion } from "../types";
import { useAppData } from "../context/AppDataContext";

type Phase = "active" | "results";

export default function QuizScreen({
  questions,
  projectId,
  onDone,
}: {
  questions: QuizQuestion[] | null;
  projectId: string | null;
  onDone: () => void;
}) {
  const { recordAttempt } = useAppData();

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Sparkles size={22} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>No Quiz in Progress</Text>
        <Text style={styles.emptySubtitle}>
          Generate one from a course's notes in Projects.
        </Text>
        <Pressable onPress={onDone}>
          <LinearGradient
            colors={[colors.gradientAccentStart, colors.gradientAccentEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Go to Projects</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <ActiveQuiz
      questions={questions}
      onFinish={(answers) => {
        if (projectId) recordAttempt(projectId, questions, answers);
      }}
      onDone={onDone}
    />
  );
}

function ActiveQuiz({
  questions,
  onFinish,
  onDone,
}: {
  questions: QuizQuestion[];
  onFinish: (answers: (number | null)[]) => void;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("active");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));

  const question = questions[currentQ];
  const score = answers.filter((a, i) => a === questions[i].correct).length;

  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progress, {
      toValue: ((currentQ + (revealed ? 1 : 0)) / questions.length) * 100,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentQ, revealed]);

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const updated = [...answers];
    updated[currentQ] = idx;
    setAnswers(updated);

    if (currentQ === questions.length - 1) {
      onFinish(updated);
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setPhase("results");
    }
  }

  function resetQuiz() {
    setPhase("active");
    setCurrentQ(0);
    setSelected(null);
    setRevealed(false);
    setAnswers(Array(questions.length).fill(null));
  }

  if (phase === "results") {
    const pct = Math.round((score / questions.length) * 100);
    const c = scoreColor(pct);
    return (
      <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsEyebrow}>QUIZ COMPLETE</Text>
          <View style={[styles.ringOuter, { borderColor: c }]}>
            <View style={styles.ringInner}>
              <Text style={[styles.ringPct, { color: c }]}>{pct}%</Text>
            </View>
          </View>
          <Text style={styles.resultsTitle}>
            {pct >= 85 ? "Excellent Work!" : pct >= 70 ? "Good Progress" : "Keep Practicing"}
          </Text>
          <Text style={styles.resultsSubtitle}>
            {score} of {questions.length} correct
          </Text>
        </View>

        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Question Review</Text>
          <View style={{ gap: 8 }}>
            {questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct;
              return (
                <View key={q.id} style={styles.reviewRow}>
                  <View
                    style={[
                      styles.reviewIcon,
                      { backgroundColor: isCorrect ? "#10B98118" : "#EF444418" },
                    ]}
                  >
                    {isCorrect ? (
                      <Check size={12} color={colors.emerald500} />
                    ) : (
                      <X size={12} color={colors.red500} />
                    )}
                  </View>
                  <View style={styles.flex1}>
                    <Text style={styles.reviewText} numberOfLines={2}>
                      {q.text}
                    </Text>
                    {!isCorrect && (
                      <Text style={styles.reviewCorrect}>Correct: {q.options[q.correct]}</Text>
                    )}
                    <View
                      style={[
                        styles.topicChip,
                        { backgroundColor: DIFFICULTY_COLORS[q.difficulty] + "18" },
                      ]}
                    >
                      <Text style={[styles.topicChipText, { color: DIFFICULTY_COLORS[q.difficulty] }]}>
                        {q.topic}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          <Pressable onPress={resetQuiz}>
            <LinearGradient
              colors={[colors.gradientAccentStart, colors.gradientAccentEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Take Another Quiz</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onDone} style={styles.backLink}>
            <Text style={styles.backLinkText}>Back to Projects</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.activeContainer}>
      <View style={{ marginBottom: 16 }}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressCount}>
            {currentQ + 1} / {questions.length}
          </Text>
          <View
            style={[
              styles.difficultyChip,
              { backgroundColor: DIFFICULTY_COLORS[question.difficulty] + "20" },
            ]}
          >
            <Text style={[styles.difficultyChipText, { color: DIFFICULTY_COLORS[question.difficulty] }]}>
              {question.difficulty}
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>

      <FadeSwitcher switchKey={String(currentQ)} style={styles.flex1}>
        <Text style={styles.topicEyebrow}>{question.topic.toUpperCase()}</Text>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.text}</Text>
        </View>

        <View style={{ gap: 10 }}>
          {question.options.map((opt, idx) => {
            let bg = colors.card;
            let borderColor = colors.border;
            let textColor = colors.foreground;
            let labelBg = "#F0EFFA";
            let labelColor = "#7171A0";

            if (revealed) {
              if (idx === question.correct) {
                bg = colors.emerald50;
                borderColor = colors.emerald400;
                textColor = colors.emerald800;
                labelBg = colors.emerald500;
                labelColor = colors.white;
              } else if (idx === selected && idx !== question.correct) {
                bg = colors.red50;
                borderColor = colors.red400;
                textColor = colors.red800;
                labelBg = colors.red500;
                labelColor = colors.white;
              }
            } else if (idx === selected) {
              bg = colors.secondary;
              borderColor = colors.primary;
            }

            return (
              <Pressable
                key={idx}
                style={[styles.optionBtn, { backgroundColor: bg, borderColor }]}
                onPress={() => handleSelect(idx)}
              >
                <View style={[styles.optionLabel, { backgroundColor: labelBg }]}>
                  <Text style={[styles.optionLabelText, { color: labelColor }]}>
                    {ANSWER_LABELS[idx]}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </FadeSwitcher>

      <View style={styles.nextBtnWrap}>
        {revealed && (
          <Pressable onPress={handleNext}>
            <LinearGradient
              colors={[colors.gradientAccentStart, colors.gradientAccentEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>
                {currentQ < questions.length - 1 ? "Next Question" : "See Results"}
              </Text>
              <ChevronRight size={15} color={colors.white} />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 8 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: { color: colors.foreground, fontSize: 18, fontFamily: fonts.displaySemibold },
  emptySubtitle: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.body,
    textAlign: "center",
    marginBottom: 16,
  },

  primaryBtn: {
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: { color: colors.white, fontSize: 17, fontFamily: fonts.displaySemibold },
  backLink: { alignItems: "center", paddingVertical: 8 },
  backLinkText: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.bodySemibold },

  // Results
  resultsHeader: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 28, alignItems: "center" },
  resultsEyebrow: {
    color: colors.mutedForeground,
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: fonts.monoMedium,
    marginBottom: 16,
  },
  ringOuter: {
    width: 112,
    height: 112,
    borderRadius: 999,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  ringInner: {
    width: 80,
    height: 80,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  ringPct: { fontSize: 28, fontFamily: fonts.displayBold },
  resultsTitle: { color: colors.foreground, fontSize: 20, fontFamily: fonts.displayBold, marginBottom: 4 },
  resultsSubtitle: { color: colors.mutedForeground, fontSize: 14, fontFamily: fonts.body },
  reviewContainer: { paddingHorizontal: 20, gap: 12 },
  reviewTitle: { color: colors.foreground, fontSize: 17, fontFamily: fonts.displaySemibold },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  reviewIcon: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  reviewText: { color: colors.foreground, fontSize: 12, fontFamily: fonts.bodyMedium, lineHeight: 17 },
  reviewCorrect: { color: colors.emerald600, fontSize: 12, marginTop: 4, fontFamily: fonts.body },
  topicChip: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  topicChipText: { fontSize: 10, fontFamily: fonts.bodyMedium },

  // Active quiz
  activeContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  progressHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  progressCount: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.mono },
  difficultyChip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  difficultyChipText: { fontSize: 10, fontFamily: fonts.bodySemibold, textTransform: "capitalize" },
  progressTrack: { height: 6, backgroundColor: colors.muted, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: colors.primary },
  topicEyebrow: {
    color: colors.mutedForeground,
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: fonts.monoMedium,
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
  },
  questionText: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bodySemibold, lineHeight: 20 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
  },
  optionLabel: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabelText: { fontSize: 11, fontFamily: fonts.monoMedium },
  optionText: { flex: 1, fontSize: 14, fontFamily: fonts.bodyMedium },
  nextBtnWrap: { paddingTop: 12, paddingBottom: 12, minHeight: 64 },
});
