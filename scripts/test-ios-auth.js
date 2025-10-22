#!/usr/bin/env node

/**
 * iOS Authentication Test Script
 *
 * This script helps test the iOS authentication flows by providing
 * automated validation of key components and generating test reports.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  testEmail: "test@crewvar.com",
  testPassword: "testpassword123",
  invalidEmail: "invalid-email",
  weakPassword: "123",
  nonExistentEmail: "nonexistent@crewvar.com",
  wrongPassword: "wrongpassword",
};

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  platform: "iOS",
  tests: [],
};

/**
 * Add a test result
 */
function addTestResult(testName, status, message = "", details = {}) {
  testResults.tests.push({
    name: testName,
    status, // 'PASS', 'FAIL', 'SKIP'
    message,
    details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  console.log("🔍 Checking required files...");

  const requiredFiles = [
    "ios/App/App/Info.plist",
    "ios/App/App.xcodeproj/project.pbxproj",
    "capacitor.config.ts",
    "src/components/auth/SignupForm.tsx",
    "src/components/auth/LoginForm.tsx",
    "src/context/AuthContextFirebase.tsx",
    "src/utils/sessionManager.ts",
    "src/firebase/auth.ts",
    "src/firebase/config.ts",
  ];

  let allFilesExist = true;

  requiredFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
      addTestResult(`File Check: ${file}`, "PASS", "File exists");
    } else {
      console.log(`❌ ${file}`);
      addTestResult(`File Check: ${file}`, "FAIL", "File missing");
      allFilesExist = false;
    }
  });

  return allFilesExist;
}

/**
 * Check iOS configuration
 */
function checkIOSConfiguration() {
  console.log("\n🍎 Checking iOS configuration...");

  try {
    // Check Info.plist
    const infoPlistPath = "ios/App/App/Info.plist";
    if (fs.existsSync(infoPlistPath)) {
      const infoPlist = fs.readFileSync(infoPlistPath, "utf8");

      // Check for required keys
      const requiredKeys = [
        "CFBundleDisplayName",
        "CFBundleIdentifier",
        "LSRequiresIPhoneOS",
      ];

      requiredKeys.forEach((key) => {
        if (infoPlist.includes(key)) {
          console.log(`✅ Info.plist contains ${key}`);
          addTestResult(
            `iOS Config: ${key}`,
            "PASS",
            "Key found in Info.plist"
          );
        } else {
          console.log(`❌ Info.plist missing ${key}`);
          addTestResult(
            `iOS Config: ${key}`,
            "FAIL",
            "Key missing from Info.plist"
          );
        }
      });
    }

    // Check Capacitor config
    const capacitorConfigPath = "capacitor.config.ts";
    if (fs.existsSync(capacitorConfigPath)) {
      const config = fs.readFileSync(capacitorConfigPath, "utf8");

      if (config.includes('appId: "com.crewvar.app"')) {
        console.log("✅ Capacitor config has correct app ID");
        addTestResult(
          "Capacitor Config: App ID",
          "PASS",
          "Correct app ID configured"
        );
      } else {
        console.log("❌ Capacitor config missing or incorrect app ID");
        addTestResult(
          "Capacitor Config: App ID",
          "FAIL",
          "Incorrect or missing app ID"
        );
      }

      if (config.includes("allowMixedContent: true")) {
        console.log("✅ Mixed content allowed for iOS");
        addTestResult(
          "Capacitor Config: Mixed Content",
          "PASS",
          "Mixed content enabled"
        );
      } else {
        console.log("❌ Mixed content not allowed");
        addTestResult(
          "Capacitor Config: Mixed Content",
          "FAIL",
          "Mixed content disabled"
        );
      }
    }
  } catch (error) {
    console.error("❌ Error checking iOS configuration:", error.message);
    addTestResult("iOS Configuration Check", "FAIL", error.message);
  }
}

/**
 * Check authentication components
 */
function checkAuthComponents() {
  console.log("\n🔐 Checking authentication components...");

  try {
    // Check SignupForm
    const signupFormPath = "src/components/auth/SignupForm.tsx";
    if (fs.existsSync(signupFormPath)) {
      const signupForm = fs.readFileSync(signupFormPath, "utf8");

      // Check for key features
      const signupFeatures = [
        "useForm",
        "yupResolver",
        "registerValidationSchema",
        "showPassword",
        "toast.success",
        'navigate("/auth/login")',
      ];

      signupFeatures.forEach((feature) => {
        if (signupForm.includes(feature)) {
          console.log(`✅ SignupForm has ${feature}`);
          addTestResult(
            `SignupForm: ${feature}`,
            "PASS",
            "Feature implemented"
          );
        } else {
          console.log(`❌ SignupForm missing ${feature}`);
          addTestResult(`SignupForm: ${feature}`, "FAIL", "Feature missing");
        }
      });
    }

    // Check LoginForm
    const loginFormPath = "src/components/auth/LoginForm.tsx";
    if (fs.existsSync(loginFormPath)) {
      const loginForm = fs.readFileSync(loginFormPath, "utf8");

      // Check for key features
      const loginFeatures = [
        "rememberMe",
        "getRememberedCredentials",
        "saveRememberedCredentials",
        "showPassword",
        "clearRememberedCredentials",
      ];

      loginFeatures.forEach((feature) => {
        if (loginForm.includes(feature)) {
          console.log(`✅ LoginForm has ${feature}`);
          addTestResult(`LoginForm: ${feature}`, "PASS", "Feature implemented");
        } else {
          console.log(`❌ LoginForm missing ${feature}`);
          addTestResult(`LoginForm: ${feature}`, "FAIL", "Feature missing");
        }
      });
    }

    // Check AuthContext
    const authContextPath = "src/context/AuthContextFirebase.tsx";
    if (fs.existsSync(authContextPath)) {
      const authContext = fs.readFileSync(authContextPath, "utf8");

      // Check for session management
      const sessionFeatures = [
        "saveUserSession",
        "getUserSession",
        "clearUserSession",
        "Capacitor",
        "sessionRestoredRef",
      ];

      sessionFeatures.forEach((feature) => {
        if (authContext.includes(feature)) {
          console.log(`✅ AuthContext has ${feature}`);
          addTestResult(
            `AuthContext: ${feature}`,
            "PASS",
            "Feature implemented"
          );
        } else {
          console.log(`❌ AuthContext missing ${feature}`);
          addTestResult(`AuthContext: ${feature}`, "FAIL", "Feature missing");
        }
      });
    }

    // Check SessionManager
    const sessionManagerPath = "src/utils/sessionManager.ts";
    if (fs.existsSync(sessionManagerPath)) {
      const sessionManager = fs.readFileSync(sessionManagerPath, "utf8");

      // Check for key functions
      const sessionFunctions = [
        "saveUserSession",
        "getUserSession",
        "clearUserSession",
        "hasValidSession",
        "updateSessionTimestamp",
        "refreshStoredToken",
      ];

      sessionFunctions.forEach((func) => {
        if (sessionManager.includes(`export const ${func}`)) {
          console.log(`✅ SessionManager has ${func}`);
          addTestResult(
            `SessionManager: ${func}`,
            "PASS",
            "Function implemented"
          );
        } else {
          console.log(`❌ SessionManager missing ${func}`);
          addTestResult(`SessionManager: ${func}`, "FAIL", "Function missing");
        }
      });
    }
  } catch (error) {
    console.error("❌ Error checking auth components:", error.message);
    addTestResult("Auth Components Check", "FAIL", error.message);
  }
}

/**
 * Check Firebase configuration
 */
function checkFirebaseConfig() {
  console.log("\n🔥 Checking Firebase configuration...");

  try {
    const firebaseConfigPath = "src/firebase/config.ts";
    if (fs.existsSync(firebaseConfigPath)) {
      const firebaseConfig = fs.readFileSync(firebaseConfigPath, "utf8");

      // Check for environment variables
      const envVars = [
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_AUTH_DOMAIN",
        "VITE_FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_STORAGE_BUCKET",
        "VITE_FIREBASE_MESSAGING_SENDER_ID",
        "VITE_FIREBASE_APP_ID",
      ];

      envVars.forEach((envVar) => {
        if (firebaseConfig.includes(envVar)) {
          console.log(`✅ Firebase config uses ${envVar}`);
          addTestResult(
            `Firebase Config: ${envVar}`,
            "PASS",
            "Environment variable configured"
          );
        } else {
          console.log(`❌ Firebase config missing ${envVar}`);
          addTestResult(
            `Firebase Config: ${envVar}`,
            "FAIL",
            "Environment variable missing"
          );
        }
      });

      // Check for singleton pattern
      if (firebaseConfig.includes("FirebaseSingleton")) {
        console.log("✅ Firebase uses singleton pattern");
        addTestResult(
          "Firebase Config: Singleton",
          "PASS",
          "Singleton pattern implemented"
        );
      } else {
        console.log("❌ Firebase missing singleton pattern");
        addTestResult(
          "Firebase Config: Singleton",
          "FAIL",
          "Singleton pattern missing"
        );
      }
    }

    // Check auth.ts
    const authPath = "src/firebase/auth.ts";
    if (fs.existsSync(authPath)) {
      const auth = fs.readFileSync(authPath, "utf8");

      // Check for key functions
      const authFunctions = [
        "signInWithEmail",
        "signUpWithEmail",
        "signOutUser",
        "resetPassword",
        "updateUserProfile",
      ];

      authFunctions.forEach((func) => {
        if (auth.includes(`export const ${func}`)) {
          console.log(`✅ Auth module has ${func}`);
          addTestResult(`Auth Module: ${func}`, "PASS", "Function implemented");
        } else {
          console.log(`❌ Auth module missing ${func}`);
          addTestResult(`Auth Module: ${func}`, "FAIL", "Function missing");
        }
      });

      // Check for APK build adaptations
      if (auth.includes("APK BUILD")) {
        console.log("✅ Auth module has APK build adaptations");
        addTestResult(
          "Auth Module: APK Adaptations",
          "PASS",
          "APK build adaptations present"
        );
      } else {
        console.log("❌ Auth module missing APK build adaptations");
        addTestResult(
          "Auth Module: APK Adaptations",
          "FAIL",
          "APK build adaptations missing"
        );
      }
    }
  } catch (error) {
    console.error("❌ Error checking Firebase config:", error.message);
    addTestResult("Firebase Config Check", "FAIL", error.message);
  }
}

/**
 * Generate test report
 */
function generateTestReport() {
  console.log("\n📊 Generating test report...");

  const report = {
    summary: {
      total: testResults.tests.length,
      passed: testResults.tests.filter((t) => t.status === "PASS").length,
      failed: testResults.tests.filter((t) => t.status === "FAIL").length,
      skipped: testResults.tests.filter((t) => t.status === "SKIP").length,
    },
    details: testResults,
  };

  // Save report to file
  const reportPath = "ios-auth-test-report.json";
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📋 Test Report Summary:`);
  console.log(`Total Tests: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Skipped: ${report.summary.skipped}`);
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Print failed tests
  const failedTests = testResults.tests.filter((t) => t.status === "FAIL");
  if (failedTests.length > 0) {
    console.log("\n❌ Failed Tests:");
    failedTests.forEach((test) => {
      console.log(`  - ${test.name}: ${test.message}`);
    });
  }

  return report;
}

/**
 * Main test execution
 */
function runTests() {
  console.log("🚀 Starting iOS Authentication Tests...\n");

  // Run all test checks
  checkRequiredFiles();
  checkIOSConfiguration();
  checkAuthComponents();
  checkFirebaseConfig();

  // Generate report
  const report = generateTestReport();

  // Exit with appropriate code
  if (report.summary.failed === 0) {
    console.log("\n✅ All tests passed! iOS authentication setup looks good.");
    process.exit(0);
  } else {
    console.log("\n❌ Some tests failed. Please review the issues above.");
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (process.argv[1] && process.argv[1].endsWith("test-ios-auth.js")) {
  runTests();
}

export {
  runTests,
  checkRequiredFiles,
  checkIOSConfiguration,
  checkAuthComponents,
  checkFirebaseConfig,
  generateTestReport,
};
