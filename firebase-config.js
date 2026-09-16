// Werte aus der Firebase Console -> Projekteinstellungen -> "SDK-Setup und Konfiguration"
// WICHTIG: Diese Datei enthält (unkritische) Client-Keys. Trotzdem: nicht committen,
// wenn das Repo öffentlich ist - lieber in .gitignore aufnehmen.
export const firebaseConfig = {
  apiKey: "$FIREBASE_API_KEY",
  authDomain: "$FIREBASE_AUTH_DOMAIN",
  projectId: "$FIREBASE_PROJECT_ID",
  storageBucket: "$FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "$FIREBASE_MESSAGING_SENDER_ID",
  appId: "$FIREBASE_APP_ID",
}
