import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, Zap, ChevronRight, LogOut, Plus } from "lucide-react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";
import ScoreBadge from "../components/ScoreBadge";
import { Tab } from "../types";
import { useAppData } from "../context/AppDataContext";
import { pluralize } from "../lib/pluralize";

function displayNameFromEmail(email: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[.\-_]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export default function HomeScreen({
  onNavigate,
  onLogout,
  userEmail,
}: {
  onNavigate: (tab: Tab, projectId?: string) => void;
  onLogout: () => void;
  userEmail: string | null;
}) {
  const { projects, projectStats, overallStats } = useAppData();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const stats = overallStats();

  const projectsWithStats = projects.map((p) => ({ project: p, stats: projectStats(p.id) }));
  const latest = projectsWithStats.length > 0 ? projectsWithStats[projectsWithStats.length - 1] : null;
  const weakProjects = projectsWithStats.filter((p) => p.stats.weakTopics.length > 0).slice(0, 2);

  const STATS = [
    { label: "Quizzes", value: String(stats.totalQuizzes) },
    { label: "Avg Score", value: stats.totalQuizzes > 0 ? `${stats.avgScore}%` : "—" },
    { label: "Notes", value: String(stats.totalNotes) },
  ];

  return (
    <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 16 }}>
      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{displayNameFromEmail(userEmail)}</Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 8 }}>
            <View style={styles.streakPill}>
              <Flame size={13} color="#fdba74" />
              <Text style={styles.streakText}>
                {stats.streakDays > 0 ? `${stats.streakDays} day streak` : "No streak yet"}
              </Text>
            </View>
            <Pressable style={styles.logoutRow} onPress={onLogout} hitSlop={8}>
              <LogOut size={12} color="rgba(255,255,255,0.65)" />
              <Text style={styles.logoutText}>Sign out</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statTile}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {latest ? (
          <View style={styles.continueCard}>
            <Text style={styles.eyebrow}>CONTINUE STUDYING</Text>
            <View style={styles.continueRow}>
              <View style={[styles.emojiTile, { backgroundColor: latest.project.bg }]}>
                <Text style={{ fontSize: 18 }}>📘</Text>
              </View>
              <View style={styles.flexShrink}>
                <Text style={styles.continueName} numberOfLines={1}>
                  {latest.project.name}
                </Text>
                <Text style={styles.continuePreview} numberOfLines={1}>
                  {pluralize(latest.stats.noteCount, "note")} · {pluralize(latest.stats.quizCount, "quiz", "quizzes")} so far
                </Text>
              </View>
              <Pressable
                style={[styles.continueBtn, { backgroundColor: latest.project.color }]}
                onPress={() => onNavigate("projects", latest.project.id)}
              >
                <Zap size={14} color={colors.white} />
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.emptyCard} onPress={() => onNavigate("projects")}>
            <Plus size={17} color={colors.primary} />
            <Text style={styles.emptyCardText}>Add your first course to get started</Text>
          </Pressable>
        )}

        {weakProjects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Needs Attention</Text>
              <Pressable onPress={() => onNavigate("projects")}>
                <Text style={styles.sectionAction}>See all</Text>
              </Pressable>
            </View>
            <View style={{ gap: 8 }}>
              {weakProjects.map(({ project, stats: pStats }) => (
                <Pressable
                  key={project.id}
                  style={styles.attentionRow}
                  onPress={() => onNavigate("projects", project.id)}
                >
                  <View style={[styles.stripe, { backgroundColor: project.color }]} />
                  <View style={styles.flexShrink}>
                    <Text style={styles.attentionCourse}>{project.course}</Text>
                    <Text style={styles.attentionWeak} numberOfLines={1}>
                      Weak: {pStats.weakTopics.slice(0, 2).join(", ")}
                    </Text>
                  </View>
                  <ScoreBadge score={pStats.lastScore} />
                  <ChevronRight size={14} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {projects.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Courses</Text>
              <Pressable onPress={() => onNavigate("projects")}>
                <Text style={styles.sectionAction}>Manage</Text>
              </Pressable>
            </View>
            <View style={styles.grid}>
              {projectsWithStats.map(({ project, stats: pStats }) => (
                <Pressable
                  key={project.id}
                  style={[
                    styles.courseTile,
                    { backgroundColor: project.bg, borderColor: project.color + "40" },
                  ]}
                  onPress={() => onNavigate("projects", project.id)}
                >
                  <Text style={[styles.courseCode, { color: project.color }]}>{project.course}</Text>
                  <Text style={styles.courseName}>{project.name}</Text>
                  <View style={styles.courseFooter}>
                    <Text style={styles.courseNotes}>{pluralize(pStats.noteCount, "note")}</Text>
                    <ScoreBadge score={pStats.lastScore} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: fonts.mono,
    marginBottom: 2,
  },
  name: {
    color: colors.white,
    fontSize: 24,
    fontFamily: fonts.displayBold,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: { color: colors.white, fontSize: 12, fontFamily: fonts.bodySemibold },
  logoutRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  logoutText: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: fonts.body },
  statsRow: { flexDirection: "row", gap: 8 },
  statTile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  statValue: { color: colors.white, fontSize: 18, fontFamily: fonts.displayBold },
  statLabel: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2, fontFamily: fonts.body },
  content: { paddingHorizontal: 20, marginTop: -12, gap: 16 },
  continueCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
  },
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 20,
  },
  emptyCardText: { color: colors.primary, fontSize: 14, fontFamily: fonts.bodySemibold },
  eyebrow: {
    color: colors.mutedForeground,
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: fonts.monoMedium,
    marginBottom: 10,
  },
  continueRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  emojiTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  flexShrink: { flex: 1, minWidth: 0 },
  continueName: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bodySemibold },
  continuePreview: { color: colors.mutedForeground, fontSize: 12, marginTop: 2, fontFamily: fonts.body },
  continueBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { color: colors.foreground, fontSize: 17, fontFamily: fonts.displaySemibold },
  sectionAction: { color: colors.primary, fontSize: 12, fontFamily: fonts.bodySemibold },
  attentionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stripe: { width: 4, alignSelf: "stretch", borderRadius: 999 },
  attentionCourse: { color: colors.foreground, fontSize: 14, fontFamily: fonts.bodySemibold },
  attentionWeak: { color: colors.mutedForeground, fontSize: 12, marginTop: 2, fontFamily: fonts.body },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  courseTile: {
    width: "48%",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
  },
  courseCode: { fontSize: 12, fontFamily: fonts.monoMedium, marginBottom: 4, letterSpacing: 0.5 },
  courseName: { color: colors.foreground, fontSize: 14, fontFamily: fonts.displaySemibold, marginBottom: 8 },
  courseFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  courseNotes: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.body },
});
