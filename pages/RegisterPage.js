import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase.js'
import { useAuth } from '../lib/AuthContext.js'
import { navigate } from '../lib/router.js'
import { html } from '../lib/html.js'

// Übersetzt Firebase-Fehlercodes in verständliche deutsche Meldungen
function errorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Diese E-Mail-Adresse ist ungültig.'
    case 'auth/email-already-in-use':
      return 'Für diese E-Mail-Adresse existiert bereits ein Konto.'
    case 'auth/weak-password':
      return 'Das Passwort muss mindestens 6 Zeichen lang sein.'
    case 'auth/missing-password':
      return 'Bitte gib ein Passwort ein.'
    default:
      return 'Registrierung ist gerade nicht möglich. Bitte versuch es später erneut.'
  }
}

export function RegisterPage() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRepeat, setPasswordRepeat] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    if (password !== passwordRepeat) {
      setError('Die Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
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
        <h1>Registrierung</h1>

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
            autoComplete="new-password"
          />
        </label>

        <label>
          Passwort wiederholen
          <input
            type="password"
            value=${passwordRepeat}
            onChange=${(e) => setPasswordRepeat(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled=${loading}>
          ${loading ? 'Wird erstellt…' : 'Konto erstellen'}
        </button>

        <p class="hint">
          Schon ein Konto?
          <a href="#/login">Jetzt einloggen</a>
        </p>
      </form>
    </div>
  `
}
