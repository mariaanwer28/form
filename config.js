/* =========================================================
   YAHAN APNI FIREBASE AUR CLOUDINARY DETAILS DAALEIN
   ========================================================= */

// --- FIREBASE CONFIG ---
// Firebase Console (console.firebase.google.com) > Project Settings > General
// > "Your apps" > Web app > SDK setup and configuration se copy karein
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// --- CLOUDINARY CONFIG ---
// Cloudinary Dashboard (cloudinary.com/console) se Cloud Name milega
// Settings > Upload > "Upload presets" main ek naya "Unsigned" preset banayein
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";
