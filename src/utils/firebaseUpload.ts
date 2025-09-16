import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// ✅ Firebase config (from your Firebase Console)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// ✅ Init Firebase App & Storage
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export const uploadToFirebase = async (file: any) => {
  if (!file) throw new Error("No file provided for upload.");

  // Create unique file name (avoid conflicts)
  const ext = path.extname(file.name);
  const uniqueFileName = `${uuidv4()}${ext}`;

  // Reference in Firebase Storage
  const storageRef = ref(storage, `documents/${uniqueFileName}`);

  // Upload file buffer
  const snapshot = await uploadBytes(storageRef, file.data, {
    contentType: file.mimetype,
  });

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  return { downloadURL };
};
