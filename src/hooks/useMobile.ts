import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Conditional imports for mobile-only features
let Device: any = null;
let Network: any = null;
let StatusBar: any = null;
let Style: any = null;
let Keyboard: any = null;
let KeyboardResize: any = null;
let App: any = null;

if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
  try {
    const deviceModule = require("@capacitor/device");
    const networkModule = require("@capacitor/network");
    const statusBarModule = require("@capacitor/status-bar");
    const keyboardModule = require("@capacitor/keyboard");
    const appModule = require("@capacitor/app");

    Device = deviceModule.Device;
    Network = networkModule.Network;
    StatusBar = statusBarModule.StatusBar;
    Style = statusBarModule.Style;
    Keyboard = keyboardModule.Keyboard;
    KeyboardResize = keyboardModule.KeyboardResize;
    App = appModule.App;
  } catch (error) {
    console.warn("Capacitor plugins not available in web environment");
  }
}

export interface DeviceInfo {
  platform: string;
  isNative: boolean;
  model?: string;
  osVersion?: string;
  manufacturer?: string;
  isVirtual?: boolean;
  isConnected: boolean;
  connectionType?: string;
}

export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: "web",
    isNative: false,
    isConnected: true,
  });

  useEffect(() => {
    const initDevice = async () => {
      try {
        const isNative = Capacitor.isNativePlatform();
        const platform = Capacitor.getPlatform();

        let model, osVersion, manufacturer, isVirtual;

        if (isNative && Device) {
          const deviceInfo = await Device.getInfo();
          model = deviceInfo.model;
          osVersion = deviceInfo.osVersion;
          manufacturer = deviceInfo.manufacturer;
          isVirtual = deviceInfo.isVirtual;
        }

        let networkStatus = { connected: true, connectionType: "unknown" };
        if (Network) {
          networkStatus = await Network.getStatus();
        }

        setDeviceInfo({
          platform,
          isNative,
          model,
          osVersion,
          manufacturer,
          isVirtual,
          isConnected: networkStatus.connected,
          connectionType: networkStatus.connectionType,
        });

        // Setup status bar for native platforms
        if (isNative && platform === "ios" && StatusBar && Style) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: "#069B93" });
        }

        // Setup keyboard handling
        if (isNative && Keyboard && KeyboardResize) {
          await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
        }
      } catch (error) {
        console.error("Error initializing device:", error);
      }
    };

    initDevice();
  }, []);

  return deviceInfo;
};

export const useAppState = () => {
  const [appState, setAppState] = useState<
    "active" | "background" | "inactive"
  >("active");

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !App) return;

    const handleAppStateChange = (state: any) => {
      setAppState(state.isActive ? "active" : "background");
    };

    App.addListener("appStateChange", handleAppStateChange);

    return () => {
      App.removeAllListeners();
    };
  }, []);

  return appState;
};

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState<string>("unknown");

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !Network) return;

    const updateNetworkStatus = async () => {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
      setConnectionType(status.connectionType);
    };

    updateNetworkStatus();

    const listener = Network.addListener(
      "networkStatusChange",
      (status: any) => {
        setIsConnected(status.connected);
        setConnectionType(status.connectionType);
      }
    );

    return () => {
      listener.remove();
    };
  }, []);

  return { isConnected, connectionType };
};
