import * as functions from "firebase-functions";
import {admin, db} from "./firebaseAdmin";
import {CallableRequest} from "firebase-functions/v2/https";


interface Note {
  content: string;
  name: string;
}

export const addNote = functions.https.onCall(
  async (data: CallableRequest<{treeId: string; note: Note}>, _context) => {
    const {treeId, note} = data.data;

    if (!treeId || !note) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Tree ID and note content are required."
      );
    }

    try {
      const noteData = {
        content: note.content,
        name: note.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const noteDoc = await db
        .collection("trees")
        .doc(treeId)
        .collection("notes")
        .add(noteData);
      return {
        success: true,
        noteId: noteDoc.id,
        message: "Note added successfully.",
      };
    } catch (error) {
      console.error("Error adding note:", error);
      throw new functions.https.HttpsError("unknown", "Failed to add note.");
    }
  }
);

export const deleteNote = functions.https.onCall(
  async (data: CallableRequest<{treeId: string; noteId: string}>, _context) => {
    const {treeId, noteId} = data.data;

    if (!treeId || !noteId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Tree ID and note ID are required."
      );
    }

    try {
      await db
        .collection("trees")
        .doc(treeId)
        .collection("notes")
        .doc(noteId)
        .delete();
      return {success: true, message: "Note deleted successfully."};
    } catch (error) {
      console.error("Error deleting note:", error);
      throw new functions.https.HttpsError("unknown", "Failed to delete note.");
    }
  }
);
