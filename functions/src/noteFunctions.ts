import * as functions from "firebase-functions";
import {admin, db} from "./firebaseAdmin";
import {getStorage} from "firebase-admin/storage";
import cors from "cors";

const storage = getStorage();
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

/* 
Test with Postman:

POST https://us-central1-[YOUR-PROJECT-ID].cloudfunctions.net/addNote

Headers:
Content-Type: application/json

Request Body:
{
  "treeId": "your-tree-id",
  "note": {
    "content": "This is a test memory",
    "name": "Test User"
  },
  "photoBase64": "optional-base64-encoded-image"
}
*/

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

      let photoURL = null;

      // If photoBase64 is provided, upload the photo
      if (photoBase64) {
        const bucket = storage.bucket();
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const photoId = `${treeId}/${timestamp}-${randomStr}.jpg`;
        const file = bucket.file(`notes/${photoId}`);
        const buffer = Buffer.from(photoBase64, "base64");

        const downloadToken = Math.random().toString(36).substring(2, 15) +
                            Math.random().toString(36).substring(2, 15);

        await file.save(buffer, {
          contentType: "image/jpeg",
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        });

        // Get public URL for the uploaded photo
        photoURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/notes%2F${encodeURIComponent(
          photoId
        )}?alt=media`;
      }

      const noteData = {
        content: note.content,
        name: note.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        photoURL,
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
    } catch (error) {
      console.error("Error adding note:", error);
      res.status(500).json({
        error: "Failed to add note.",
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

      // Delete photo from storage if it exists
      const noteDoc = await noteRef.get();
      if (noteDoc.exists && noteDoc.data()?.photoURL) {
        const photoURL = noteDoc.data()?.photoURL;
        const photoPath = decodeURIComponent(
          photoURL.split("/o/")[1].split("?")[0]
        );
        const file = storage.bucket().file(photoPath);
        await file.delete();
      }

      // Delete the note document
      await noteRef.delete();

      res.json({
        success: true,
        message: "Note deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({
        error: "Failed to delete note.",
      });
    }
  });
});
