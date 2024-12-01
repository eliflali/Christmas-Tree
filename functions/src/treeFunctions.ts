import {onCall, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {db} from "./firebaseAdmin";


// Function to create a tree
export const createTree = onCall(async (request: CallableRequest) => {
  const {treeName} = request.data;
  // Check if the user is authenticated
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  try {
    const tree = {
      userId: request.auth.uid, // Use authenticated user's ID
      treeName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const treeDoc = await db.collection("trees").add(tree);
    return {
      success: true,
      treeId: treeDoc.id,
      message: "Tree created successfully.",
    };
  } catch (error) {
    console.error("Error creating tree:", error);
    throw new Error("Failed to create tree.");
  }
});

// Function to delete a tree and its associated notes
export const deleteTree = onCall(async (request: CallableRequest) => {
  const {treeId} = request.data;

  // Check if the user is authenticated
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  try {
    // Delete all notes in the tree
    const notesSnapshot = await db
      .collection("trees")
      .doc(treeId)
      .collection("notes")
      .get();
    const deletePromises = notesSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    // Delete the tree itself
    await db.collection("trees").doc(treeId).delete();
    return {success: true, message: "Tree deleted successfully."};
  } catch (error) {
    console.error("Error deleting tree:", error);
    throw new Error("Failed to delete tree.");
  }
});
