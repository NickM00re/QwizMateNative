import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

// Lightweight stand-in for framer-motion's <AnimatePresence mode="wait">:
// fades + slides new content in whenever `switchKey` changes.
export default function FadeSwitcher({
  switchKey,
  children,
  style,
}: {
  switchKey: string;
  children: React.ReactNode;
  style?: any;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(6);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [switchKey]);

  return (
    <Animated.View
      style={[style, { opacity, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}
