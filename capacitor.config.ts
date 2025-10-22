import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.crewvar.app",
  appName: "Crewvar",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    App: {
      launchUrl: "com.crewvar.app://",
    },
  },
  // Add environment variables for build
  android: {
    allowMixedContent: true,
  },
  ios: {
    allowMixedContent: true,
  },
};

export default config;
