/**
 * Hook to handle app state changes and maintain session
 *
 * This hook listens for app state changes (foreground/background) and
 * updates session timestamps to maintain authentication persistence.
 */

import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { updateSessionTimestamp } from "../utils/sessionManager";

export const useAppState = () => {
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    const handleAppStateChange = async (state: any) => {
      console.log("📱 App state changed:", state);

      if (state.isActive) {
        // App came to foreground - update session timestamp
        console.log("📱 App became active - updating session timestamp");
        await updateSessionTimestamp();
      }
    };

    // Listen for app state changes
    App.addListener("appStateChange", handleAppStateChange).then((listener) => {
      listenerRef.current = listener;
    });

    // Also update timestamp when component mounts (app becomes active)
    updateSessionTimestamp();

    // Cleanup function
    return () => {
      if (listenerRef.current) {
        listenerRef.current.remove();
      }
    };
  }, []);
};
