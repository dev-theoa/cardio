# Willkommen in dieser README!
Hier ist die alte README von Claude :)

# Vokabel-Trainer – npm-freie Version (Schritt 1)

Gleiche Funktionalität wie die Vite-Variante, aber ganz ohne npm, ohne
Build-Schritt. React, React-DOM und Firebase werden direkt im Browser als
ES-Module von einem CDN (esm.sh) geladen. Statt JSX/Babel kommt `htm` zum
Einsatz (`html\`<div>...\`` statt `<div>...</div>`) – sieht fast gleich aus,
braucht aber keinen Compiler.

## Starten (kein npm nötig)

Browser blockieren ES-Module über `file://` aus Sicherheitsgründen – du
brauchst also einen ganz simplen lokalen Server. Eine dieser Optionen reicht:

**Falls Python auf deinem Rechner ist** (bei macOS/Linux meist vorinstalliert):
```bash
cd vokabel-app-nobuild
python3 -m http.server 8000
```
Dann im Browser öffnen: http://localhost:8000

**Falls du VS Code nutzt:** Erweiterung "Live Server" installieren, Rechtsklick
auf `index.html` → "Open with Live Server".

## Setup

1. `firebase-config.js` öffnen und die Werte aus der Firebase Console eintragen
   (siehe Kommentare in der Datei).
2. Server starten (siehe oben), Seite im Browser öffnen.
3. Du solltest automatisch zu `#/login` weitergeleitet werden.

## Struktur

- `lib/firebase.js` – Firebase-Initialisierung
- `lib/html.js` – JSX-Ersatz ohne Build-Schritt (htm)
- `lib/AuthContext.js` – globaler Auth-Status (`useAuth()`)
- `lib/router.js` – einfaches Hash-Routing (`#/login`, `#/add`, ...)
- `components/ProtectedRoute.js` – schützt eingeloggte Bereiche
- `pages/` – eine Datei je Hauptansicht

## Nächster Schritt

Schritt 2: Firebase Authentication konkret anbinden (Login/Registrierung).
