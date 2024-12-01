import * as admin from "firebase-admin";

// Import functions from other files
import {createTree, deleteTree} from "./treeFunctions";
import {addNote, deleteNote} from "./noteFunctions";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
  console.log("Firebase Admin initialized");
}

// Export the functions
export {createTree, deleteTree, addNote, deleteNote};
