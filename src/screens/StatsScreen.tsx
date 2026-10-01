// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import React, { useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Animated, StyleSheet } from "react-native";
import { Brain, TrendingUp } from "lucide-react-native";
import { colors, radius, scoreColor } from "../theme/colors";
import { fonts } from "../theme/fonts";
import TrendLineChart from "../components/TrendLineChart";
import { useAppData } from "../context/AppDataContext";
import { Tab } from "../types";

function TopicBar({ topic, score, delay }: { topic: string; score: number; delay: number }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: score,
      duration: 900,
      delay,
      useNativeDriver: false,
    }).start();
  }, []);

  return (
    <View>
      <View style={styles.topicRow}>
        <Text style={styles.topicLabel}>{topic}</Text>
        <Text style={[styles.topicScore, { color: scoreColor(score) }]}>{score}%</Text>
      </View>
      <View style={styles.topicTrack}>
        <Animated.View
          style={[
            styles.topicFill,
            {
              backgroundColor: scoreColor(score),
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function StatsScreen({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { projects, overallStats } = useAppData();
  const stats = overallStats();

  const TILES = [
    { label: "Avg Score", value: stats.totalQuizzes > 0 ? `${stats.avgScore}%` : "—", color: "#6366F1" },
    { label: "Streak", value: `${stats.streakDays}d`, color: "#F59E0B" },
    { label: "Total Qs", value: String(stats.totalQuestions), color: "#10B981" },
  ];

  const strongest = stats.topicScores[0];
  const weakest = stats.topicScores[stats.topicScores.length - 1];
  const hasWeakTopic = stats.topicScores.some((t) => t.score < 75);

  return (
    <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        <Text style={styles.subtitle}>
          {projects.length > 0 ? `Across ${projects.length} course${projects.length > 1 ? "s" : ""}` : "No courses yet"}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.tilesRow}>
          {TILES.map(({ label, value, color }) => (
            <View key={label} style={styles.tile}>
              <Text style={[styles.tileValue, { color }]}>{value}</Text>
              <Text style={styles.tileLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Trend</Text>
          <Text style={styles.cardSubtitle}>Last {stats.trend.length || 0} quiz sessions</Text>
          {stats.trend.length >= 2 ? (
            <TrendLineChart data={stats.trend} height={120} />
          ) : (
            <Text style={styles.emptyText}>Take a couple of quizzes to see your trend here.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Topic Breakdown</Text>
          <Text style={styles.cardSubtitle}>Average score per topic</Text>
          {stats.topicScores.length > 0 ? (
            <View style={{ gap: 14 }}>
              {stats.topicScores.map(({ topic, score }, i) => (
                <TopicBar key={topic} topic={topic} score={score} delay={150 + i * 80} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Take a quiz to see your topic breakdown.</Text>
          )}
        </View>

        {strongest && weakest && (
          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Brain size={17} color={colors.indigo600} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.insightTitle}>QwizMate Insight</Text>
              <Text style={styles.insightBody}>
                {strongest.topic === weakest.topic
                  ? `You've only seen "${strongest.topic}" so far (${strongest.score}%). Take more quizzes across topics to build a fuller picture.`
                  : `You score highest on ${strongest.topic} (${strongest.score}%). ${weakest.topic} (${weakest.score}%) could use more practice.`}
              </Text>
            </View>
          </View>
        )}

        {hasWeakTopic && (
          <View style={styles.ctaCard}>
            <View style={styles.ctaIcon}>
              <TrendingUp size={17} color={colors.primary} />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.ctaTitle}>Practice Weak Topics</Text>
              <Text style={styles.ctaSubtitle}>Generate a fresh quiz from a course's notes</Text>
            </View>
            <Pressable style={styles.ctaBtn} onPress={() => onNavigate("projects")}>
              <Text style={styles.ctaBtnText}>Go</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { color: colors.foreground, fontSize: 24, fontFamily: fonts.displayBold, marginBottom: 2 },
  subtitle: { color: colors.mutedForeground, fontSize: 14, fontFamily: fonts.body },
  body: { paddingHorizontal: 20, gap: 16 },
  tilesRow: { flexDirection: "row", gap: 8 },
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  tileValue: { fontSize: 20, fontFamily: fonts.displayBold },
  tileLabel: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body, marginTop: 2 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  cardTitle: { color: colors.foreground, fontSize: 17, fontFamily: fonts.displaySemibold, marginBottom: 2 },
  cardSubtitle: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body, marginBottom: 16 },
  emptyText: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.body },
  topicRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  topicLabel: { color: colors.foreground, fontSize: 14, fontFamily: fonts.body },
  topicScore: { fontSize: 14, fontFamily: fonts.bodyBold },
  topicTrack: { height: 6, backgroundColor: colors.muted, borderRadius: 999, overflow: "hidden" },
  topicFill: { height: "100%", borderRadius: 999 },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: colors.indigo50,
    borderWidth: 1,
    borderColor: colors.indigo200,
    borderRadius: radius.lg,
    padding: 16,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.indigo100,
    alignItems: "center",
    justifyContent: "center",
  },
  insightTitle: { color: colors.indigo800, fontSize: 14, fontFamily: fonts.bodySemibold, marginBottom: 4 },
  insightBody: { color: colors.indigo700, fontSize: 12, lineHeight: 17, fontFamily: fonts.body },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaTitle: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bodySemibold },
  ctaSubtitle: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ctaBtnText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodyBold },
});
