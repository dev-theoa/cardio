// Werte aus der Firebase Console -> Projekteinstellungen -> "SDK-Setup und Konfiguration"
// WICHTIG: Diese Datei enthält (unkritische) Client-Keys. Trotzdem: nicht committen,
// wenn das Repo öffentlich ist - lieber in .gitignore aufnehmen.
export const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTHDOMAIN,
  projectId: process.env.PROJECTID,
  storageBucket: process.env.STORAGEBUCKET,
  messagingSenderId: process.env.MESSAGINGSENDERID,
  appId: process.env.APPID,
}
