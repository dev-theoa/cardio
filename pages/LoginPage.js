import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase.js'
import { useAuth } from '../lib/AuthContext.js'
import { navigate } from '../lib/router.js'
import { html } from '../lib/html.js'

// Übersetzt Firebase-Fehlercodes in verständliche deutsche Meldungen
function errorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Diese E-Mail-Adresse ist ungültig.'
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
      return 'E-Mail oder Passwort ist falsch.'
    case 'auth/wrong-password':
      return 'E-Mail oder Passwort ist falsch.'
    case 'auth/too-many-requests':
      return 'Zu viele Versuche. Bitte warte einen Moment und versuch es erneut.'
    case 'auth/missing-password':
      return 'Bitte gib ein Passwort ein.'
    default:
      return 'Login ist gerade nicht möglich. Bitte versuch es später erneut.'
  }
}

export function LoginPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Bereits eingeloggt? Dann gehört man nicht mehr auf die Login-Seite.
  if (user) {
    navigate('/')
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Bitte E-Mail und Passwort ausfüllen.')
      return
    }

    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  return html`
    <div class="auth-page">
      <form class="auth-form" onSubmit=${handleSubmit}>
        <h1>Login</h1>

        ${error && html`<p class="error">${error}</p>`}

        <label>
          E-Mail
          <input
            type="email"
            value=${email}
            onChange=${(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Passwort
          <input
            type="password"
            value=${password}
            onChange=${(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled=${loading}>
          ${loading ? 'Wird geprüft…' : 'Einloggen'}
        </button>

        <p class="hint">
          Noch kein Konto?
          <a href="#/register">Jetzt registrieren</a>
        </p>
      </form>
    </div>
  `
}
