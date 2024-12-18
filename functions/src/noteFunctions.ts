import * as functions from "firebase-functions";
import {admin, db} from "./firebaseAdmin";
import cors from "cors";

const corsHandler = cors({origin: true});

interface AddNoteData {
  treeId: string;
  note: {
    content: string;
    name: string;
  };
  photoBase64?: string;
}

interface DeleteNoteData {
  treeId: string;
  noteId: string;
}

export const addNote = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const data = req.body as AddNoteData;
      const {treeId, note, photoBase64} = data;

      if (!treeId || !note) {
        res.status(400).json({
          error: "Tree ID and note content are required.",
        });
        return;
      }

      // Create note data with base64 image if provided
      const noteData = {
        content: note.content,
        name: note.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        photoBase64: photoBase64 || null,
      };

      const noteDoc = await db
        .collection("trees")
        .doc(treeId)
        .collection("notes")
        .add(noteData);

      res.json({
        success: true,
        noteId: noteDoc.id,
        message: "Note added successfully.",
      });
    } catch (error: unknown) {
      console.error("Error adding note:", error);
      const errorMessage = error instanceof Error ?
        error.message :
        "Failed to add note.";
      res.status(500).json({
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  });
});

export const deleteNote = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const data = req.body as DeleteNoteData;
      const {treeId, noteId} = data;

      if (!treeId || !noteId) {
        res.status(400).json({
          error: "Tree ID and note ID are required.",
        });
        return;
      }

      const noteRef = db
        .collection("trees")
        .doc(treeId)
        .collection("notes")
        .doc(noteId);

      // Delete the note document
      await noteRef.delete();

      res.json({
        success: true,
        message: "Note deleted successfully.",
      });
    } catch (error: unknown) {
      console.error("Error deleting note:", error);
      const errorMessage = error instanceof Error ?
        error.message :
        "Failed to delete note.";
      res.status(500).json({
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      });
    }
  });
});
