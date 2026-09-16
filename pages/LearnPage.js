import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { html } from '../lib/html.js'

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function LearnPage({ stackId }) {
  const [stack, setStack] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Lern-Session-Status
  const [queue, setQueue] = useState([])
  const [totalInRound, setTotalInRound] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const snap = await getDoc(doc(db, 'stacks', stackId))
        if (cancelled) return
        if (!snap.exists()) {
          setError('Diesen Stapel gibt es nicht (mehr).')
        } else {
          const data = snap.data()
          setStack(data)
          const initial = shuffle(data.cards || [])
          setQueue(initial)
          setTotalInRound(initial.length)
          setFinished(initial.length === 0)
        }
      } catch (err) {
        console.error(err)
        setError('Stapel konnte nicht geladen werden.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [stackId])

  function handleAnswer(wasCorrect) {
    setFlipped(false)
    setQueue((prev) => {
      const [current, ...rest] = prev
      // Falsch beantwortet -> Karte kommt ans Ende der Warteschlange zurück,
      // bis sie einmal richtig beantwortet wurde.
      const next = wasCorrect ? rest : [...rest, current]
      if (next.length === 0) setFinished(true)
      return next
    })
  }

  if (loading) return html`<div class="page"><p>Lädt…</p></div>`
  if (error) return html`<div class="page"><p class="error">${error}</p> <a href="#/">Zurück</a></div>`

  if (finished) {
    return html`
      <div class="page">
        <div class="learn-card">
          <h1>Geschafft! 🎉</h1>
          <p>Du hast alle ${totalInRound} Karten aus "${stack.title}" richtig beantwortet.</p>
          <a class="primary-link" href="#/">Zurück zur Übersicht</a>
        </div>
      </div>
    `
  }

  const current = queue[0]
  const remaining = queue.length

  return html`
    <div class="page">
      <div class="learn-card">
        <p class="learn-progress">${remaining} von ${totalInRound} noch offen</p>

        <div class="flashcard" onClick=${() => setFlipped((f) => !f)}>
          <p class="flashcard-label">${flipped ? 'Rückseite' : 'Vorderseite'}</p>
          <p class="flashcard-text">${flipped ? current.back : current.front}</p>
          <p class="flashcard-hint">Zum Umdrehen klicken</p>
        </div>

        ${flipped
          ? html`
              <div class="answer-buttons">
                <button class="wrong-btn" onClick=${() => handleAnswer(false)}>✗ Falsch</button>
                <button class="correct-btn" onClick=${() => handleAnswer(true)}>✓ Richtig</button>
              </div>
            `
          : html`<p class="hint">Erst umdrehen, dann bewerten.</p>`}
      </div>
    </div>
  `
}
