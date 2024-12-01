// functions/src/firebaseAdmin.ts
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  console.log("Initializing Firebase Admin SDK");
  admin.initializeApp();
} else {
  console.log("Firebase Admin SDK already initialized");
}

const db = admin.firestore();

export {admin, db};
