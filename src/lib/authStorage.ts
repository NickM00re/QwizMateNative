import AsyncStorage from "@react-native-async-storage/async-storage";

const LOGGED_IN_KEY = "qwizmate.auth.loggedIn";
const EMAIL_KEY = "qwizmate.auth.email";

export interface StoredAuthState {
  loggedIn: boolean;
  email: string | null;
}

export async function loadAuthState(): Promise<StoredAuthState> {
  const [[, loggedIn], [, email]] = await AsyncStorage.multiGet([LOGGED_IN_KEY, EMAIL_KEY]);
  return { loggedIn: loggedIn === "true", email: email || null };
}

export async function setLoggedIn(value: boolean): Promise<void> {
  await AsyncStorage.setItem(LOGGED_IN_KEY, value ? "true" : "false");
}

export async function setStoredEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(EMAIL_KEY, email);
}
