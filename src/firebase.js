/**
 * firebase.js
 * Initialises the Firebase app and exports the Auth instance.
 *
 * Config values are read from Vite environment variables.
 * Copy .env.example → .env.local and fill in your project's values.
 *
 * Only Firebase Authentication is used — no Firestore, no Storage.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdKApvV1nF5W-kLS88oiTvXfbZlbrCle4",
  authDomain: "type-nova-x.firebaseapp.com",
  projectId: "type-nova-x",
  storageBucket: "type-nova-x.appspot.com",
  messagingSenderId: "1051482748984",
  appId: "1:1051482748984:web:1234567890abcdef",
};

const app = initializeApp(firebaseConfig);

/** Shared Auth instance — import this wherever auth is needed. */
export const auth = getAuth(app);
