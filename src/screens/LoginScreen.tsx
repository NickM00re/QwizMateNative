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
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Brain, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { colors, radius } from "../theme/colors";
import { fonts } from "../theme/fonts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({
  onLogin,
}: {
  onLogin: (email: string) => void;
}) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    // No backend yet — simulate a network round trip, then let App.tsx
    // decide where to route based on whether any projects exist locally.
    setTimeout(() => {
      setSubmitting(false);
      onLogin(email.trim());
    }, 500);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex1}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.logoBadge}>
            <Brain size={26} color={colors.white} />
          </View>
          <Text style={styles.brand}>QwizMate</Text>
          <Text style={styles.tagline}>Turn your notes into quizzes</Text>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.modeSwitch}>
            {(["signIn", "signUp"] as const).map((m) => (
              <Pressable
                key={m}
                style={[styles.modeTab, mode === m && styles.modeTabActive]}
                onPress={() => {
                  setMode(m);
                  setError(null);
                }}
              >
                <Text style={[styles.modeTabText, mode === m && styles.modeTabTextActive]}>
                  {m === "signIn" ? "Sign In" : "Sign Up"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Mail size={16} color={colors.mutedForeground} />
              <TextInput
                style={styles.input}
                placeholder="you@school.edu"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Lock size={16} color={colors.mutedForeground} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={16} color={colors.mutedForeground} />
                ) : (
                  <Eye size={16} color={colors.mutedForeground} />
                )}
              </Pressable>
            </View>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={handleSubmit} disabled={submitting}>
            <LinearGradient
              colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === "signIn" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.disclaimer}>
            Demo build — any email and a 6+ character password will sign you in.
          </Text>
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
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  brand: { color: colors.white, fontSize: 26, fontFamily: fonts.displayBold },
  tagline: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: fonts.body, marginTop: 4 },
  body: { paddingHorizontal: 24, paddingTop: 28, gap: 16 },
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  modeTabActive: {
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  modeTabText: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.bodySemibold },
  modeTabTextActive: { color: colors.primary },
  field: { gap: 6 },
  label: { color: colors.foreground, fontSize: 13, fontFamily: fonts.bodySemibold },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: colors.foreground,
    fontSize: 14,
    fontFamily: fonts.body,
    padding: 0,
  },
  error: { color: colors.destructive, fontSize: 12, fontFamily: fonts.bodyMedium },
  submitBtn: {
    borderRadius: radius.lg,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.displaySemibold },
  disclaimer: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 4,
  },
});
