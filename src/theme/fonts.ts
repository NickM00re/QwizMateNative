// QwizMate | SENG 564 | Fall 2026
// Author: Nick Moore

import {
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from "@expo-google-fonts/barlow-condensed";
import {
  DMMono_400Regular,
  DMMono_500Medium,
  DMMono_400Regular_Italic,
} from "@expo-google-fonts/dm-mono";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from "@expo-google-fonts/nunito";

// Font family names as loaded by useFonts() in App.tsx via @expo-google-fonts/*.
// Mirrors the original app's font stack:
//   'Barlow Condensed'  -> headings / big numbers
//   'DM Mono'           -> labels, mono captions, eyebrow text
//   'Nunito' (body/base default text used everywhere else)
export const fonts = {
  displayBold: "BarlowCondensed_700Bold",
  displaySemibold: "BarlowCondensed_600SemiBold",
  mono: "DMMono_400Regular",
  monoMedium: "DMMono_500Medium",
  monoItalic: "DMMono_400Regular_Italic",
  body: "Nunito_400Regular",
  bodyMedium: "Nunito_500Medium",
  bodySemibold: "Nunito_600SemiBold",
  bodyBold: "Nunito_700Bold",
};

export const fontMap = {
  BarlowCondensed_700Bold,
  BarlowCondensed_600SemiBold,
  DMMono_400Regular,
  DMMono_500Medium,
  DMMono_400Regular_Italic,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
};
