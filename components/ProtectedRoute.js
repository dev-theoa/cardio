import { useAuth } from '../lib/AuthContext.js'
import { html } from '../lib/html.js'

// Schützt Ansichten, die nur eingeloggte Nutzer sehen dürfen (z.B. Übersicht, Lernansicht, Profil)
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return html`<p>Laden…</p>`
  if (!user) {
    window.location.hash = '#/login'
    return null
  }

  return children
}
