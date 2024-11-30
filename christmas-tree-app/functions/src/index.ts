import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { createTree, deleteTree } from './treeFunctions';
import { addNote, deleteNote } from './noteFunctions';

// Initialize Firebase Admin SDK
admin.initializeApp();

export { createTree, deleteTree, addNote, deleteNote };
