// Redirect URI Debug Script
// Run this in your browser console to see what redirect URI is being generated

console.log("=== Redirect URI Debug ===");
console.log("Current URL:", window.location.href);
console.log("Origin:", window.location.origin);
console.log(
  "Generated Redirect URI:",
  window.location.origin + "/auth/google-callback"
);
console.log("=========================");

// Check if running in Capacitor
const isCapacitor =
  typeof window !== "undefined" && window.Capacitor?.isNativePlatform();
console.log("Is Capacitor:", isCapacitor);

if (isCapacitor) {
  console.log("Capacitor Platform:", window.Capacitor?.getPlatform());
}
