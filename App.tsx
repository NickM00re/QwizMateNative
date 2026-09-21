import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { fontMap } from "./src/theme/fonts";
import { colors } from "./src/theme/colors";
import { QuizQuestion, Tab } from "./src/types";
import { loadAuthState, setLoggedIn, setStoredEmail } from "./src/lib/authStorage";
import { AppDataProvider, useAppData } from "./src/context/AppDataContext";
import BottomNav from "./src/components/BottomNav";
import FadeSwitcher from "./src/components/FadeSwitcher";
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProjectsScreen from "./src/screens/ProjectsScreen";
import QuizScreen from "./src/screens/QuizScreen";
import StatsScreen from "./src/screens/StatsScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

type AuthStatus = "checking" | "loggedOut" | "loggedIn";

export default function App() {
  return (
    <AppDataProvider>
      <AppInner />
    </AppDataProvider>
  );
}

function AppInner() {
  const { ready: dataReady, projects } = useAppData();
  const [fontsLoaded, fontError] = useFonts(fontMap);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<{ questions: QuizQuestion[]; projectId: string } | null>(
    null
  );
  const [initialRouteSet, setInitialRouteSet] = useState(false);

  useEffect(() => {
    loadAuthState().then((state) => {
      setUserEmail(state.email);
      setAuthStatus(state.loggedIn ? "loggedIn" : "loggedOut");
    });
  }, []);

  // Real routing decision: once we know both auth and local data are loaded,
  // send brand-new accounts (no projects yet) to create one, everyone else Home.
  useEffect(() => {
    if (authStatus === "loggedIn" && dataReady && !initialRouteSet) {
      setTab(projects.length === 0 ? "projects" : "home");
      setInitialRouteSet(true);
    }
  }, [authStatus, dataReady, initialRouteSet]);

  const appReady = (fontsLoaded || !!fontError) && authStatus !== "checking" && dataReady;

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  function handleLoginSuccess(email: string) {
    setLoggedIn(true).catch(() => {});
    setStoredEmail(email).catch(() => {});
    setUserEmail(email);
    setTab(projects.length === 0 ? "projects" : "home");
    setInitialRouteSet(true);
    setAuthStatus("loggedIn");
  }

  function handleLogout() {
    setLoggedIn(false).catch(() => {});
    setAuthStatus("loggedOut");
    setSelectedProjectId(null);
    setActiveQuiz(null);
    setInitialRouteSet(false);
  }

  function handleNavigate(targetTab: Tab, projectId?: string) {
    setTab(targetTab);
    if (projectId !== undefined) setSelectedProjectId(projectId);
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    if (newTab !== "projects") setSelectedProjectId(null);
    if (newTab !== "quiz") setActiveQuiz(null);
  }

  function handleProjectCreated(wasFirst: boolean) {
    if (wasFirst) setTab("home");
  }

  if (authStatus === "loggedOut") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root} edges={["top"]} onLayout={onLayoutRootView}>
          <StatusBar style="dark" />
          <LoginScreen onLogin={handleLoginSuccess} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top"]} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <View style={styles.screenArea}>
          <FadeSwitcher switchKey={tab + (selectedProjectId ?? "")} style={styles.flex1}>
            {tab === "home" && (
              <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} userEmail={userEmail} />
            )}
            {tab === "projects" && (
              <ProjectsScreen
                selectedId={selectedProjectId}
                onSelect={(id) => setSelectedProjectId(id)}
                onBack={() => setSelectedProjectId(null)}
                onStartQuiz={(questions, projectId) => {
                  setActiveQuiz({ questions, projectId });
                  handleNavigate("quiz");
                }}
                onProjectCreated={handleProjectCreated}
              />
            )}
            {tab === "quiz" && (
              <QuizScreen
                questions={activeQuiz?.questions ?? null}
                projectId={activeQuiz?.projectId ?? null}
                onDone={() => handleNavigate("projects", activeQuiz?.projectId)}
              />
            )}
            {tab === "stats" && <StatsScreen onNavigate={handleNavigate} />}
          </FadeSwitcher>
        </View>
        <BottomNav tab={tab} onChange={handleTabChange} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenArea: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
});
