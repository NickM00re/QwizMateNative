// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import { Platform } from "react-native";

// Points at the local FastAPI server in server/. Edit this for your setup:
// - Physical phone in Expo Go: use your computer's LAN IP, e.g. "http://192.168.1.42:8000"
// - Android emulator: "http://10.0.2.2:8000" (localhost from the emulator's own perspective)
// - iOS simulator / web: "http://localhost:8000" works as-is
// - Deployed backend (Render/Railway/Fly.io/etc): its https URL
export const API_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
