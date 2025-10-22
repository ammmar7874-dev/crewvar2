# iOS Authentication Test Plan

## Overview

This document outlines comprehensive testing procedures for the iOS authentication flows in the CrewVar app, specifically focusing on signup and signin functionality.

## Test Environment Setup

### Prerequisites

- ✅ iOS app built successfully with Capacitor
- ✅ Xcode workspace opened
- ✅ Firebase configuration in place
- ✅ Session management implemented for iOS

### Test Devices/Simulators

- iOS Simulator (iPhone 14, iPhone 15)
- Physical iOS device (if available)
- Different iOS versions (iOS 15+, iOS 16, iOS 17)

## Test Cases

### 1. Signup Flow Testing

#### Test Case 1.1: Valid Email Signup

**Objective**: Verify successful user registration with valid email and password

**Steps**:

1. Launch the iOS app
2. Navigate to signup screen
3. Enter valid email address (e.g., test@example.com)
4. Enter password (minimum 6 characters, no spaces)
5. Confirm password (must match)
6. Tap "Sign up" button

**Expected Results**:

- ✅ Form validation passes
- ✅ User account created in Firebase Auth
- ✅ User profile created in Firestore
- ✅ User automatically signed out after signup
- ✅ Redirected to login screen
- ✅ Success toast message displayed
- ✅ Session data stored in Capacitor Preferences

**Validation Points**:

- Check Firebase Console for new user
- Check Firestore for user profile document
- Verify session storage in iOS app

#### Test Case 1.2: Invalid Email Format

**Objective**: Verify proper validation for invalid email formats

**Steps**:

1. Launch the iOS app
2. Navigate to signup screen
3. Enter invalid email (e.g., "invalid-email", "test@", "@example.com")
4. Enter valid password
5. Confirm password
6. Tap "Sign up" button

**Expected Results**:

- ❌ Form validation fails
- ❌ Error message displayed: "Please enter a valid email address"
- ❌ No account created

#### Test Case 1.3: Weak Password

**Objective**: Verify password strength validation

**Steps**:

1. Launch the iOS app
2. Navigate to signup screen
3. Enter valid email
4. Enter weak password (e.g., "123", "abc")
5. Confirm password
6. Tap "Sign up" button

**Expected Results**:

- ❌ Form validation fails
- ❌ Error message: "Password must be at least 6 characters"
- ❌ No account created

#### Test Case 1.4: Password Mismatch

**Objective**: Verify password confirmation validation

**Steps**:

1. Launch the iOS app
2. Navigate to signup screen
3. Enter valid email
4. Enter password: "password123"
5. Enter different confirm password: "password456"
6. Tap "Sign up" button

**Expected Results**:

- ❌ Form validation fails
- ❌ Error message: "Passwords do not match"
- ❌ No account created

#### Test Case 1.5: Duplicate Email

**Objective**: Verify handling of existing email addresses

**Steps**:

1. Launch the iOS app
2. Navigate to signup screen
3. Enter email that already exists in system
4. Enter valid password
5. Confirm password
6. Tap "Sign up" button

**Expected Results**:

- ❌ Firebase Auth error
- ❌ Error message: "An account with this email already exists. Please use a different email or try logging in."
- ❌ No duplicate account created

### 2. Signin Flow Testing

#### Test Case 2.1: Valid Credentials

**Objective**: Verify successful login with valid credentials

**Steps**:

1. Launch the iOS app
2. Navigate to login screen
3. Enter valid email address
4. Enter correct password
5. Optionally check "Remember Email & Password"
6. Tap "Sign In" button

**Expected Results**:

- ✅ Authentication successful
- ✅ User redirected to dashboard
- ✅ User profile loaded
- ✅ Session stored in Capacitor Preferences
- ✅ Success toast message displayed
- ✅ User marked as online in Firestore

**Validation Points**:

- Check Firebase Auth state
- Verify user profile data
- Confirm session persistence
- Check Firestore user status

#### Test Case 2.2: Invalid Email

**Objective**: Verify handling of non-existent email

**Steps**:

1. Launch the iOS app
2. Navigate to login screen
3. Enter non-existent email
4. Enter any password
5. Tap "Sign In" button

**Expected Results**:

- ❌ Authentication fails
- ❌ Error message: "Invalid email or password. Please check your credentials and try again."
- ❌ User remains on login screen

#### Test Case 2.3: Wrong Password

**Objective**: Verify handling of incorrect password

**Steps**:

1. Launch the iOS app
2. Navigate to login screen
3. Enter valid email address
4. Enter incorrect password
5. Tap "Sign In" button

**Expected Results**:

- ❌ Authentication fails
- ❌ Error message: "Invalid email or password. Please check your credentials and try again."
- ❌ User remains on login screen

#### Test Case 2.4: Remember Me Functionality

**Objective**: Verify credential storage and retrieval

**Steps**:

1. Launch the iOS app
2. Navigate to login screen
3. Enter valid credentials
4. Check "Remember Email & Password"
5. Tap "Sign In" button
6. Sign out
7. Return to login screen

**Expected Results**:

- ✅ Credentials automatically filled
- ✅ "Remember Me" checkbox checked
- ✅ User can login without re-entering credentials

#### Test Case 2.5: Clear Stored Credentials

**Objective**: Verify ability to clear stored credentials

**Steps**:

1. Launch the iOS app
2. Navigate to login screen (with stored credentials)
3. Tap "Clear Stored Credentials" link
4. Verify form is cleared

**Expected Results**:

- ✅ Email field cleared
- ✅ Password field cleared
- ✅ "Remember Me" unchecked
- ✅ Success message displayed

### 3. Session Management Testing

#### Test Case 3.1: Session Persistence

**Objective**: Verify session persists across app restarts

**Steps**:

1. Login to the app
2. Close the app completely
3. Reopen the app
4. Verify user remains logged in

**Expected Results**:

- ✅ User automatically logged in
- ✅ Dashboard loads without login screen
- ✅ User profile data available
- ✅ Session restored from Capacitor Preferences

#### Test Case 3.2: Session Expiration

**Objective**: Verify session handling after token expiration

**Steps**:

1. Login to the app
2. Wait for token expiration (1 hour)
3. Perform action requiring authentication
4. Verify session refresh or re-authentication

**Expected Results**:

- ✅ Token refreshed automatically
- ✅ User remains logged in
- ✅ No interruption to user experience

#### Test Case 3.3: Logout Functionality

**Objective**: Verify complete logout process

**Steps**:

1. Login to the app
2. Navigate to logout option
3. Tap logout
4. Verify complete signout

**Expected Results**:

- ✅ User signed out from Firebase Auth
- ✅ Session cleared from Capacitor Preferences
- ✅ Redirected to login screen
- ✅ User marked as offline in Firestore

### 4. Error Handling Testing

#### Test Case 4.1: Network Connectivity

**Objective**: Verify behavior with poor/no network connection

**Steps**:

1. Disable network connection
2. Attempt to signup/signin
3. Re-enable network
4. Retry authentication

**Expected Results**:

- ❌ Appropriate error message for network issues
- ✅ Authentication works when network restored

#### Test Case 4.2: Server Errors

**Objective**: Verify handling of server-side errors

**Steps**:

1. Attempt authentication during server maintenance
2. Verify error handling

**Expected Results**:

- ❌ User-friendly error message
- ❌ No app crash
- ✅ Graceful degradation

### 5. UI/UX Testing

#### Test Case 5.1: Form Validation Feedback

**Objective**: Verify real-time form validation

**Steps**:

1. Navigate to signup/login forms
2. Test various input scenarios
3. Verify immediate feedback

**Expected Results**:

- ✅ Real-time validation messages
- ✅ Clear error indicators
- ✅ Intuitive user guidance

#### Test Case 5.2: Password Visibility Toggle

**Objective**: Verify password visibility controls

**Steps**:

1. Navigate to password fields
2. Tap eye icon to toggle visibility
3. Verify password text visibility

**Expected Results**:

- ✅ Password visibility toggles correctly
- ✅ Eye icon changes appropriately
- ✅ Works on both password fields

#### Test Case 5.3: Loading States

**Objective**: Verify loading indicators during authentication

**Steps**:

1. Perform signup/signin actions
2. Observe loading states
3. Verify proper feedback

**Expected Results**:

- ✅ Loading spinner displayed
- ✅ Button states disabled during processing
- ✅ Clear visual feedback

## Test Execution Checklist

### Pre-Test Setup

- [ ] iOS app built and deployed
- [ ] Test environment configured
- [ ] Firebase project accessible
- [ ] Test user accounts prepared
- [ ] Network connectivity verified

### Test Execution

- [ ] All signup test cases executed
- [ ] All signin test cases executed
- [ ] Session management tests completed
- [ ] Error handling scenarios tested
- [ ] UI/UX validation performed

### Post-Test Validation

- [ ] Firebase Console data verified
- [ ] Firestore documents checked
- [ ] Session storage validated
- [ ] Error logs reviewed
- [ ] Performance metrics analyzed

## Known Issues and Limitations

### Current Limitations

1. **Google OAuth Disabled**: Google sign-in is disabled for mobile builds
2. **Email Verification Disabled**: Email verification flow is disabled for APK builds
3. **Session Persistence**: Uses custom session management instead of Firebase persistence

### iOS-Specific Considerations

1. **Capacitor Preferences**: Uses Capacitor Preferences for session storage
2. **Deep Links**: Custom URI scheme configured for OAuth flows
3. **Mixed Content**: Allow mixed content enabled for development

## Test Results Summary

### Signup Flow Results

- [ ] Test Case 1.1: Valid Email Signup - [PASS/FAIL]
- [ ] Test Case 1.2: Invalid Email Format - [PASS/FAIL]
- [ ] Test Case 1.3: Weak Password - [PASS/FAIL]
- [ ] Test Case 1.4: Password Mismatch - [PASS/FAIL]
- [ ] Test Case 1.5: Duplicate Email - [PASS/FAIL]

### Signin Flow Results

- [ ] Test Case 2.1: Valid Credentials - [PASS/FAIL]
- [ ] Test Case 2.2: Invalid Email - [PASS/FAIL]
- [ ] Test Case 2.3: Wrong Password - [PASS/FAIL]
- [ ] Test Case 2.4: Remember Me Functionality - [PASS/FAIL]
- [ ] Test Case 2.5: Clear Stored Credentials - [PASS/FAIL]

### Session Management Results

- [ ] Test Case 3.1: Session Persistence - [PASS/FAIL]
- [ ] Test Case 3.2: Session Expiration - [PASS/FAIL]
- [ ] Test Case 3.3: Logout Functionality - [PASS/FAIL]

### Error Handling Results

- [ ] Test Case 4.1: Network Connectivity - [PASS/FAIL]
- [ ] Test Case 4.2: Server Errors - [PASS/FAIL]

### UI/UX Results

- [ ] Test Case 5.1: Form Validation Feedback - [PASS/FAIL]
- [ ] Test Case 5.2: Password Visibility Toggle - [PASS/FAIL]
- [ ] Test Case 5.3: Loading States - [PASS/FAIL]

## Recommendations

### Immediate Actions

1. **Set up test environment**: Configure Firebase project with test data
2. **Execute test cases**: Run through all test scenarios systematically
3. **Document results**: Record pass/fail status for each test case
4. **Address failures**: Fix any identified issues

### Future Improvements

1. **Re-enable Google OAuth**: Implement proper OAuth flow for iOS
2. **Email verification**: Add email verification for production builds
3. **Enhanced error handling**: Improve error messages and recovery
4. **Performance optimization**: Optimize authentication flow performance

## Conclusion

This test plan provides comprehensive coverage of iOS authentication flows. Execute these tests systematically to ensure the signup and signin functionality works correctly on iOS devices and simulators.

**Next Steps**:

1. Run the iOS app in Xcode
2. Execute test cases in order
3. Document results
4. Address any issues found
5. Validate production readiness
