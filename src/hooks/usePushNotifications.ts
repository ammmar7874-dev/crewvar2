import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "../context/AuthContextFirebase";
import { savePushToken } from "../firebase/firestore";

// Conditional imports for mobile-only features
let PushNotifications: any = null;

if (typeof window !== "undefined" && Capacitor.isNativePlatform()) {
  try {
    const pushModule = require("@capacitor/push-notifications");
    PushNotifications = pushModule.PushNotifications;
  } catch (error) {
    console.warn("Push notifications not available in web environment");
  }
}

import { toast } from "react-toastify";

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  notifications: any[];
}

export const usePushNotifications = () => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    notifications: [],
  });

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !PushNotifications) {
      setState((prev) => ({ ...prev, isSupported: false }));
      return;
    }

    const initPushNotifications = async () => {
      try {
        // Check if push notifications are supported
        const isSupported = await PushNotifications.checkPermissions().then(
          (permission: any) => permission.receive === "granted"
        );

        if (!isSupported) {
          // Request permissions
          const permission = await PushNotifications.requestPermissions();
          if (permission.receive !== "granted") {
            console.warn("Push notification permissions not granted");
            return;
          }
        }

        setState((prev) => ({ ...prev, isSupported: true }));

        // Register for push notifications
        await PushNotifications.register();

        // Listen for registration success
        PushNotifications.addListener("registration", async (token: any) => {
          console.log("Push registration success, token: " + token.value);
          setState((prev) => ({
            ...prev,
            token: token.value,
            isRegistered: true,
          }));

          try {
            if (currentUser?.uid) {
              await savePushToken(currentUser.uid, token.value, Capacitor.getPlatform());
            } else {
              console.warn("No user available to bind push token");
            }
          } catch (e) {
            console.error("Failed to persist push token:", e);
          }
        });

        // Listen for registration errors
        PushNotifications.addListener("registrationError", (error: any) => {
          console.error("Error on registration: " + JSON.stringify(error));
          toast.error("Failed to register for push notifications");
        });

        // Listen for incoming notifications
        PushNotifications.addListener(
          "pushNotificationReceived",
          (notification: any) => {
            console.log("Push notification received: ", notification);
            setState((prev) => ({
              ...prev,
              notifications: [notification, ...prev.notifications.slice(0, 9)], // Keep last 10
            }));
          }
        );

        // Listen for notification actions
        PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (notification: any) => {
            console.log("Push notification action performed", notification);

            // Handle notification tap actions here
            const { actionId, notification: notif } = notification;

            if (actionId === "tap") {
              // Handle tap action
              console.log("Notification tapped:", notif);
            }
          }
        );
      } catch (error) {
        console.error("Error initializing push notifications:", error);
        toast.error("Failed to initialize push notifications");
      }
    };

    initPushNotifications();

    return () => {
      // Cleanup listeners
      if (PushNotifications) {
        PushNotifications.removeAllListeners();
      }
    };
  }, [currentUser]);

  const sendTestNotification = async () => {
    if (!state.token) {
      toast.error("No push token available");
      return;
    }

    try {
      // This would typically be done on your server
      // For now, just show a local notification
      toast.info("Test notification sent!");
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification");
    }
  };

  const clearNotifications = () => {
    setState((prev) => ({ ...prev, notifications: [] }));
  };

  return {
    ...state,
    sendTestNotification,
    clearNotifications,
  };
};
