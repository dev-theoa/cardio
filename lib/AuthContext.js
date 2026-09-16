import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase.js'
import { html } from './html.js'

const AuthContext = createContext({ user: null, loading: true })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Reagiert automatisch auf Login/Logout/Session-Wiederherstellung
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return html`<${AuthContext.Provider} value=${{ user, loading }}>${children}<//>`
}

export function useAuth() {
  return useContext(AuthContext)
}
