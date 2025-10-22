import React, { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

// Conditional imports for mobile-only features
let StatusBar: any = null;
let Style: any = null;
let Keyboard: any = null;

if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
  try {
    const statusBarModule = require("@capacitor/status-bar");
    const keyboardModule = require("@capacitor/keyboard");
    StatusBar = statusBarModule.StatusBar;
    Style = statusBarModule.Style;
    Keyboard = keyboardModule.Keyboard;
  } catch (error) {
    console.warn("Capacitor plugins not available in web environment");
  }
}

import { useDevice, useNetworkStatus } from "../../hooks/useMobile";

interface MobileWrapperProps {
  children: React.ReactNode;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({ children }) => {
  const device = useDevice();
  const { isConnected } = useNetworkStatus();

  useEffect(() => {
    const setupMobileEnvironment = async () => {
      if (!device.isNative || !StatusBar || !Keyboard) return;

      try {
        // Setup status bar for both iOS and Android
        if (device.platform === "ios") {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: "#069B93" });
        } else if (device.platform === "android") {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: "#069B93" });
        }

        // Setup keyboard
        await Keyboard.setResizeMode({ mode: "body" });
        await Keyboard.setScroll({ isDisabled: false });
      } catch (error) {
        console.error("Error setting up mobile environment:", error);
      }
    };

    setupMobileEnvironment();
  }, [device.isNative, device.platform]);

  // Show offline indicator
  if (!isConnected && device.isNative) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Internet Connection
          </h2>
          <p className="text-gray-600">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${device.isNative ? "mobile-app" : "web-app"}`}
    >
      {children}
    </div>
  );
};

export const MobileHeader: React.FC<{ title: string; onBack?: () => void }> = ({
  title,
  onBack,
}) => {
  const device = useDevice();

  if (!device.isNative) return null;

  return (
    <div className="bg-teal-600 text-white px-4 py-3 flex items-center justify-between">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-teal-700 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      <h1 className="text-lg font-semibold flex-1 text-center">{title}</h1>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export const MobileBottomNav: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const device = useDevice();

  if (!device.isNative) return null;

  const tabs = [
    { id: "dashboard", label: "Home", icon: "🏠" },
    { id: "connections", label: "Connections", icon: "👥" },
    { id: "chat", label: "Chat", icon: "💬" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "text-teal-600 bg-teal-50"
                : "text-gray-600 hover:text-teal-600"
            }`}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
