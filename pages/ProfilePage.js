import { useState } from 'react'
import { signOut, deleteUser } from 'firebase/auth'
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase.js'
import { useAuth } from '../lib/AuthContext.js'
import { html } from '../lib/html.js'

export function ProfilePage() {
  const { user } = useAuth()
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [working, setWorking] = useState(false)

  async function handleLogout() {
    await signOut(auth)
    // ProtectedRoute übernimmt danach automatisch die Weiterleitung zu #/login
  }

  async function handleDeleteAccount() {
    setError('')
    setWorking(true)
    try {
      // Erst alle eigenen Stapel löschen, damit keine verwaisten Daten übrig bleiben
      const q = query(collection(db, 'stacks'), where('ownerId', '==', user.uid))
      const snap = await getDocs(q)
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))

      // Dann das Konto selbst löschen
      await deleteUser(user)
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/requires-recent-login') {
        setError(
          'Aus Sicherheitsgründen musst du dich kurz erneut einloggen, bevor du dein Konto löschen kannst. Bitte logg dich aus und wieder ein, und versuch es dann direkt nochmal.'
        )
      } else {
        setError('Konto konnte nicht gelöscht werden. Bitte versuch es erneut.')
      }
      setWorking(false)
    }
  }

  return html`
    <div class="page">
      <div class="profile-card">
        <h1>Profil</h1>
        <p class="profile-email">${user.email}</p>

        ${error && html`<p class="error">${error}</p>`}

        <button class="secondary-btn" onClick=${handleLogout}>Ausloggen</button>

        ${!confirming
          ? html`
              <button class="danger-link" onClick=${() => setConfirming(true)}>
                Konto löschen
              </button>
            `
          : html`
              <div class="confirm-box">
                <p>
                  Wirklich löschen? Dein Konto und <strong>alle</strong> deine gespeicherten
                  Stapel werden unwiderruflich entfernt.
                </p>
                <div class="confirm-buttons">
                  <button class="secondary-btn" onClick=${() => setConfirming(false)} disabled=${working}>
                    Abbrechen
                  </button>
                  <button class="wrong-btn" onClick=${handleDeleteAccount} disabled=${working}>
                    ${working ? 'Wird gelöscht…' : 'Endgültig löschen'}
                  </button>
                </div>
              </div>
            `}

        <p class="hint"><a href="#/">Zurück zur Übersicht</a></p>
      </div>
    </div>
  `
}
