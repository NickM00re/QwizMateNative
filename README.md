# QwizMate — React Native (Expo) app

**Author:** Nick Moore · SENG 564 · Fall 2026

This is a React Native conversion of the original QwizMate Figma/web export
(`QwizMateApp`, a Vite + React + Tailwind single-page app). It reproduces the
same 4 screens, colors, fonts, layout, copy and mock data — rebuilt with
native React Native components so it runs as a real mobile app instead of a
website.

**What's the same as the original:**
- All 4 screens: Home, Projects (list + detail), Quiz (setup → active →
  results), Stats
- The exact color palette, gradients, typography (Barlow Condensed, DM Mono,
  Nunito), spacing and rounded-card look
- The exact mock data (courses, quiz questions, score trend, topic scores)
- The same interaction logic (answer selection/reveal, scoring, quiz reset,
  project drill-down, tab navigation)
- Animated progress bar, animated topic bars, animated tab icons, and a
  fade/slide transition between screens (recreating the framer-motion
  animations using React Native's built-in `Animated` API)

**What changed, because it's now a native app instead of a browser demo:**
- The old "phone mockup inside a browser window" wrapper (the dark gradient
  backdrop, the fake phone bezel/notch, the desktop sidebar blurb) is gone —
  your app *is* the phone now, so it just renders full-screen with a real
  safe-area/notch handled by the OS.
- `recharts` (web-only) was replaced with a small native SVG line chart
  (`react-native-svg`) that looks the same.
- `lucide-react-native` replaces `lucide-react` (same icon set, same names).
- `expo-linear-gradient` replaces CSS `linear-gradient(...)`.
- Tailwind utility classes were translated to `StyleSheet` objects (React
  Native doesn't run a CSS engine).

## Project structure

```
App.tsx                  entry point — loads fonts, owns tab/selection state
src/
  theme/colors.ts         color tokens ported from theme.css
  theme/fonts.ts           font family names + the useFonts() map
  types.ts                 Tab / Project / QuizQuestion types
  data/mockData.ts         the same mock projects/questions/stats as before
  components/
    ScoreBadge.tsx
    TrendLineChart.tsx      native SVG replacement for the recharts chart
    BottomNav.tsx            custom animated tab bar
    FadeSwitcher.tsx         fade/slide transition helper
  screens/
    HomeScreen.tsx
    ProjectsScreen.tsx
    QuizScreen.tsx
    StatsScreen.tsx
assets/                   app icon, splash, adaptive icon (placeholder purple mark — swap anytime)
```

## Running it on your phone (fastest way — no computer needed for previewing)

1. Install the **Expo Go** app from the App Store / Play Store on your phone.
2. On a computer, unzip this project, then from inside the folder run:
   ```
   npm install
   npx expo start
   ```
3. Scan the QR code that appears with your phone's camera (iOS) or the Expo
   Go app (Android). The app opens live on your device, and hot-reloads as
   you edit code.

> No Mac or Android Studio needed for this — Expo Go handles it. Every
> library used here (`react-native-svg`, `expo-linear-gradient`,
> `expo-font`, the Google Fonts packages, `lucide-react-native`) works
> inside Expo Go with no native build step.

### If you don't have a computer handy

You can paste the contents of `App.tsx` and everything under `src/` into a
project on [snack.expo.dev](https://snack.expo.dev) (Expo's in-browser
playground) and preview it live on your phone via the Expo Go app — no
local installs at all. You'll need to add the same dependencies listed in
`package.json` in Snack's dependency panel.

## Building an actual installable app (App Store / Play Store, or a standalone .apk/.ipa)

Once you're happy with it in Expo Go, use **EAS Build** (Expo's free-tier
cloud build service) to produce a real installable binary:

```
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # installable .apk
eas build --platform ios --profile preview        # requires an Apple developer account for device installs
```

I can help you set up `eas.json` and walk through this whenever you're
ready — just ask.

## Adding to it from here

The whole app is intentionally simple and readable — same shape as the
original single-file version, just split by screen. A few natural next
steps if you want to extend it:
- Wire up real note uploads (the "Upload New Notes" button is currently
  decorative, same as in the original export)
- Replace the mock quiz generation with a real backend/AI call
- Add persistent storage (e.g. `AsyncStorage` or a backend) so progress
  survives app restarts
- Swap the placeholder app icon/splash in `assets/` for your own branding

## Version note

`package.json` pins Expo SDK 52-era versions as a reference. Since I
couldn't reach the npm registry from this environment to verify the very
latest compatible versions, once you run `npm install` for the first time,
it's worth running:

```
npx expo install --fix
```

which lets the Expo CLI align every package to whatever the current SDK
expects.
