// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import React, { useEffect, useRef } from "react";
import { View, Text, Pressable, Animated, StyleSheet } from "react-native";
import { Home, Layers, Brain, BarChart2 } from "lucide-react-native";
import { Tab } from "../types";
import { colors } from "../theme/colors";
import { fonts } from "../theme/fonts";

const NAV_ITEMS: { id: Tab; label: string; Icon: React.ComponentType<any> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "projects", label: "Projects", Icon: Layers },
  { id: "quiz", label: "Quiz", Icon: Brain },
  { id: "stats", label: "Stats", Icon: BarChart2 },
];

function NavIcon({ Icon, active }: { Icon: React.ComponentType<any>; active: boolean }) {
  const scale = useRef(new Animated.Value(active ? 1.12 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.12 : 1,
      friction: 8,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon
        size={20}
        strokeWidth={active ? 2.5 : 1.8}
        color={active ? colors.primary : colors.mutedForeground}
      />
    </Animated.View>
  );
}

export default function BottomNav({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <View style={styles.bar}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = tab === id;
        return (
          <Pressable
            key={id}
            style={styles.item}
            onPress={() => onChange(id)}
            android_ripple={{ color: colors.muted, borderless: true }}
          >
            <NavIcon Icon={Icon} active={active} />
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.mutedForeground },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 8,
    height: 62,
    backgroundColor: "rgba(255,255,255,0.98)",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.bodySemibold,
  },
});
