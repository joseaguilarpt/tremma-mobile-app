import * as React from "react";
import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme as DarkTheme,
} from "react-native-paper";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

export const navigationDarkTheme = {
  ...NavigationDarkTheme,
  dark: true,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: "rgb(99, 211, 255)", // Primary color
    background: "rgb(29, 34, 37)", // Background color
    card: "rgb(25, 28, 30)", // Surface color (used for cards)
    text: "rgb(225, 226, 228)", // OnBackground color
    border: "rgb(138, 146, 151)", // Outline color
    notification: "rgb(255, 180, 171)", // Error color
  },
};

export const darkTheme = {
  ...DarkTheme,

  colors: {
    secondary: "rgb(231, 216, 204)",
    onSecondary: "rgb(53, 122, 143)",
    primaryContainer: "rgb(0, 77, 99)",
    onPrimaryContainer: "rgb(188, 233, 255)",
    primary: "rgb(207, 105, 46)",
    onPrimary: "rgb(231, 216, 204)",
    secondaryContainer: "rgb(53, 74, 83)",
    onSecondaryContainer: "rgb(208, 230, 242)",
    tertiary: "rgb(197, 194, 234)",
    onTertiary: "rgb(46, 45, 77)",
    tertiaryContainer: "rgb(69, 67, 100)",
    onTertiaryContainer: "rgb(226, 223, 255)",
    error: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",
    background: "rgb(31, 34, 58)",
    onBackground: "rgb(225, 226, 228)",
    surface: "rgb(31, 34, 58)",
    onSurface: "rgb(225, 226, 228)",
    surfaceVariant: "rgb(64, 72, 76)",
    onSurfaceVariant: "rgb(192, 200, 205)",
    outline: "rgb(138, 146, 151)",
    outlineVariant: "rgb(64, 72, 76)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(225, 226, 228)",
    inverseOnSurface: "rgb(46, 49, 50)",
    inversePrimary: "rgb(0, 103, 131)",
    elevation: {
      level0: "transparent",
      level1: "rgb(29, 37, 41)",
      level2: "rgb(31, 43, 48)",
      level3: "rgb(33, 48, 55)",
      level4: "rgb(34, 50, 57)",
      level5: "rgb(35, 54, 62)",
    },
    surfaceDisabled: "rgba(225, 226, 228, 0.12)",
    onSurfaceDisabled: "rgba(225, 226, 228, 0.38)",
    backdrop: "rgba(42, 50, 53, 0.4)",
  },
  fonts: {
    ...DarkTheme.fonts,
    titleLarge: {
      ...DarkTheme.fonts.titleLarge,
      fontFamily: "Futura-Bold",
      fontWeight: "normal",
    },
    titleMedium: {
      ...DarkTheme.fonts.titleMedium,
      fontFamily: "Futura-Bold",
      fontWeight: "normal",
    },
    titleSmall: {
      ...DarkTheme.fonts.titleSmall,
      fontFamily: "Futura-Bold",
      fontWeight: "normal",
    },
  },
};

export const defaultNavigationTheme = {
  ...NavigationDefaultTheme,
  dark: false, // Set to true if you want this to be a dark theme
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: "rgb(99, 211, 255)", // Primary color
    background: "rgb(25, 28, 30)", // Background color for screens
    card: "rgb(25, 28, 30)", // Surface color (used for headers/cards)
    text: "rgb(225, 226, 228)", // Text color on backgrounds
    border: "rgb(138, 146, 151)", // Outline color for borders
    notification: "rgb(255, 180, 171)", // Error color for notifications
  },
};

export const defaultTheme = {
  ...DefaultTheme,

  colors: {
    primary: "rgb(99, 211, 255)",
    onPrimary: "rgb(0, 77, 99)",
    primaryContainer: "rgb(0, 53, 69)",
    onPrimaryContainer: "rgb(188, 233, 255)",
    secondary: "rgb(201, 135, 91)",
    onSecondary: "rgb(221, 101, 22)",
    secondaryContainer: "rgb(131, 151, 160)",
    onSecondaryContainer: "rgb(208, 230, 242)",
    tertiary: "rgb(197, 194, 234)",
    onTertiary: "rgb(46, 45, 77)",
    tertiaryContainer: "rgb(69, 67, 100)",
    onTertiaryContainer: "rgb(226, 223, 255)",
    error: "rgb(255, 180, 171)",
    onError: "rgb(105, 0, 5)",
    errorContainer: "rgb(147, 0, 10)",
    onErrorContainer: "rgb(255, 180, 171)",
    background: "rgb(225, 226, 228)",
    onBackground: "rgb(25, 28, 30)",
    surface: "rgb(225, 226, 228)",
    onSurface: "rgb(25, 28, 30)",
    surfaceVariant: "rgb(64, 72, 76)",
    onSurfaceVariant: "rgb(192, 200, 205)",
    outline: "rgb(138, 146, 151)",
    outlineVariant: "rgb(64, 72, 76)",
    shadow: "rgb(0, 0, 0)",
    scrim: "rgb(0, 0, 0)",
    inverseSurface: "rgb(225, 226, 228)",
    inverseOnSurface: "rgb(46, 49, 50)",
    inversePrimary: "rgb(0, 103, 131)",
    elevation: {
      level0: "transparent",
      level1: "rgb(29, 37, 41)",
      level2: "rgb(31, 43, 48)",
      level3: "rgb(33, 48, 55)",
      level4: "rgb(34, 50, 57)",
      level5: "rgb(35, 54, 62)",
    },
    surfaceDisabled: "rgba(225, 226, 228, 0.12)",
    onSurfaceDisabled: "rgba(225, 226, 228, 0.38)",
    backdrop: "rgba(42, 50, 53, 0.4)",
  },
  fonts: {
    ...DefaultTheme.fonts,
    titleLarge: {
      ...DefaultTheme.fonts.titleLarge,
      fontFamily: "Futura-Bold",
      fontWeight: "normal",
    },
    titleMedium: {
      ...DefaultTheme.fonts.titleMedium,
      fontFamily: "Futura-Bold",
      fontWeight: "normal",
    },
    titleSmall: {
      ...DefaultTheme.fonts.titleSmall,
      fontFamily: "Futura-Bold",
      fontWeight: "normal",
    },
  },
};
