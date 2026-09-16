import { useEffect, useState } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../lib/AuthContext.js'
import { html } from '../lib/html.js'

export function HomePage() {
  const { user } = useAuth()
  const [stacks, setStacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'stacks'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setStacks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setError('')
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError('Stapel konnten nicht geladen werden.')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  return html`
    <div class="page">
      <div class="home">
        <div class="home-header">
          <h1>Deine Stapel</h1>
          <div class="home-header-actions">
            <a class="primary-link" href="#/add">+ Neuer Stapel</a>
            <a class="secondary-link" href="#/profile">Profil</a>
          </div>
        </div>

        ${error && html`<p class="error">${error}</p>`}

        ${loading && html`<p>Lädt…</p>`}

        ${!loading && stacks.length === 0 && !error &&
        html`<p class="hint">Du hast noch keine Stapel. Leg deinen ersten an!</p>`}

        <div class="stack-list">
          ${stacks.map(
            (stack) => html`
              <a class="stack-card" href="#/learn/${stack.id}" key=${stack.id}>
                <span class="stack-title">${stack.title}</span>
                <span class="stack-count">${stack.cards?.length ?? 0} Karten</span>
              </a>
            `
          )}
        </div>
      </div>
    </div>
  `
}
