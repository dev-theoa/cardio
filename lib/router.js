// Sehr einfaches Hash-basiertes Routing (z.B. seite.html#/learn/abc123) - braucht kein react-router.
import { useEffect, useState } from 'react'

export function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash.replace(/^#/, '') || '/'
}

export function navigate(path) {
  window.location.hash = path
}
