import "dotenv/config";

export default ({ config }) => ({
  ...config,
  expo: {
    name: "Arrow",
    slug: "tremma-mobile-app",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./src/assets/images/arrow-lg.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.tremma.mobileapp",
    },
    splash: {
      image: "./src/assets/images/arrow-lg.png",
      imageWidth: 300,
      resizeMode: "contain",
      backgroundColor: "#1f223a",
    },
    android: {
      jsEngine: "hermes",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/android-icon-96x96.png",
        backgroundColor: "#1e1847",
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
      package: "com.tremma.mobileapp",
      permissions: ["RECEIVE_BOOT_COMPLETED"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/android-icon-96x96.png",
    },
    plugins: [
      "expo-router",
      "expo-splash-screen",
      "expo-background-task",
      [
        "expo-font",
        {
          assets: ["./src/assets/fonts/"],
        },
      ],
      "expo-build-properties",
      "expo-sqlite",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      router: {
        origin: false,
      },
      eas: {
        projectId: "cec49e41-ff33-4c34-9d46-c2af936142d7",
      },
    },
    owner: "joseaguilarpt",
  },
});
