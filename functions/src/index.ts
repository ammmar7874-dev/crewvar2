import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import nodemailer from "nodemailer";
import crypto from "crypto";

const app = initializeApp();
const db = getFirestore(app);

const OTP_COLLECTION = "otpRequests";
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().gmail.user,
    pass: functions.config().gmail.pass,
  },
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash("sha256").update(otp + salt).digest("hex");
}

async function findActiveRequest(email: string) {
  const snap = await db
    .collection(OTP_COLLECTION)
    .where("email", "==", email)
    .where("used", "==", false)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

export const requestOtp = functions.https.onCall(async (data, context) => {
  const emailRaw = (data?.email || "").toString().trim().toLowerCase();
  if (!emailRaw || !/^[^@]+@[^@]+\.[^@]+$/.test(emailRaw)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid email");
  }

  // Basic cooldown to reduce abuse
  const existing = await findActiveRequest(emailRaw);
  if (existing) {
    const last = existing.data();
    const lastMs = last.createdAt?.toMillis?.() ?? last.createdAt;
    if (Date.now() - lastMs < RESEND_COOLDOWN_MS) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "Please wait before requesting another code."
      );
    }
  }

  const otp = generateOtp();
  const salt = crypto.randomBytes(16).toString("hex");
  const otpHash = hashOtp(otp, salt);
  const now = Timestamp.now();

  await db.collection(OTP_COLLECTION).add({
    email: emailRaw,
    otpHash,
    salt,
    used: false,
    attempts: 0,
    createdAt: now,
    expiresAt: Timestamp.fromMillis(now.toMillis() + OTP_TTL_MS),
  });

  await transporter.sendMail({
    from: functions.config().app?.from || functions.config().gmail.user,
    to: emailRaw,
    subject: `Your Crewvar login code`,
    text: `Your login code is ${otp}. It expires in 5 minutes.`,
    html: `<p>Your login code is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });

  return { success: true };
});

export const verifyOtp = functions.https.onCall(async (data, context) => {
  const emailRaw = (data?.email || "").toString().trim().toLowerCase();
  const codeRaw = (data?.code || "").toString().trim();

  if (!emailRaw || !/^[^@]+@[^@]+\.[^@]+$/.test(emailRaw)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid email");
  }
  if (!/^\d{6}$/.test(codeRaw)) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid code");
  }

  const docSnap = await findActiveRequest(emailRaw);
  if (!docSnap) {
    throw new functions.https.HttpsError("not-found", "No active code. Request a new one.");
  }

  const ref = docSnap.ref;
  const dataDoc = docSnap.data();

  const expMs = dataDoc.expiresAt?.toMillis?.() ?? dataDoc.expiresAt;
  if (Date.now() > expMs) {
    await ref.update({ used: true });
    throw new functions.https.HttpsError("deadline-exceeded", "Code expired. Request a new one.");
  }

  if (dataDoc.attempts >= MAX_ATTEMPTS) {
    await ref.update({ used: true });
    throw new functions.https.HttpsError("resource-exhausted", "Too many attempts. Request a new code.");
  }

  const computed = hashOtp(codeRaw, dataDoc.salt);
  const ok = crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(dataDoc.otpHash));
  if (!ok) {
    await ref.update({ attempts: FieldValue.increment(1) });
    throw new functions.https.HttpsError("permission-denied", "Incorrect code.");
  }

  await ref.update({ used: true, verifiedAt: Timestamp.now() });

  // Ensure an Auth user exists
  let userRecord;
  try {
    userRecord = await getAuth().getUserByEmail(emailRaw);
  } catch {
    userRecord = await getAuth().createUser({ email: emailRaw, emailVerified: true, disabled: false });
  }

  // Ensure a Firestore profile
  const userDoc = db.collection("users").doc(userRecord.uid);
  const profile = await userDoc.get();
  if (!profile.exists) {
    await userDoc.set({
      id: userRecord.uid,
      email: emailRaw,
      displayName: emailRaw.split("@")[0],
      isEmailVerified: true,
      isActive: true,
      isAdmin: false,
      isOnline: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } else {
    await userDoc.update({ isEmailVerified: true, updatedAt: Timestamp.now() });
  }

  const customToken = await getAuth().createCustomToken(userRecord.uid);
  return { success: true, token: customToken };
});
