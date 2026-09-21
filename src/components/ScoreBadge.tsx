import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { scoreColor } from "../theme/colors";
import { fonts } from "../theme/fonts";

export default function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Text style={styles.noQuizzes}>No quizzes</Text>;
  }
  const c = scoreColor(score);
  return (
    <View style={[styles.badge, { backgroundColor: c + "22" }]}>
      <Text style={[styles.badgeText, { color: c }]}>{score}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  noQuizzes: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#7171a0",
    fontFamily: fonts.body,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: fonts.bodyBold,
  },
});
