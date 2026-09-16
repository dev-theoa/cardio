import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../lib/AuthContext.js'
import { navigate } from '../lib/router.js'
import { takePendingCards } from '../lib/importStore.js'
import { html } from '../lib/html.js'

export function ReviewImportPage() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState(() => {
    const pending = takePendingCards()
    return pending && pending.length > 0 ? pending : null
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!cards) {
    return html`
      <div class="page">
        <div class="stack-form">
          <h1>Erkannte Vokabeln überprüfen</h1>
          <p>Es liegen gerade keine gescannten Vokabeln vor.</p>
          <a class="primary-link" href="#/add">Zurück zum Scannen</a>
        </div>
      </div>
    `
  }

  function updateCard(index, field, value) {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card))
    )
  }

  function swapCard(index) {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { front: card.back, back: card.front } : card))
    )
  }

  function removeCardRow(index) {
    setCards((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Bitte gib dem Stapel einen Namen.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const cleanCards = cards
      .map((c) => ({ front: c.front.trim(), back: c.back.trim() }))
      .filter((c) => c.front && c.back)

    if (cleanCards.length === 0) {
      setError('Bitte stell sicher, dass mindestens eine Karte Vorder- und Rückseite hat.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setSaving(true)
    try {
      await addDoc(collection(db, 'stacks'), {
        ownerId: user.uid,
        title: title.trim(),
        cards: cleanCards,
        createdAt: serverTimestamp(),
      })
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Speichern hat nicht geklappt. Bitte versuch es erneut.')
    } finally {
      setSaving(false)
    }
  }

  return html`
    <div class="page">
      <form class="stack-form" onSubmit=${handleSubmit}>
        <h1>Erkannte Vokabeln überprüfen</h1>
        <p class="hint">
          Kontrolliere die automatisch erkannten Vokabeln, korrigiere Tippfehler und lösche
          falsch erkannte Zeilen, bevor du speicherst.
        </p>

        ${error && html`<p class="error">${error}</p>`}

        <label>
          Name des Stapels
          <input
            type="text"
            value=${title}
            onChange=${(e) => setTitle(e.target.value)}
            placeholder="z.B. Englisch – Unit 3"
          />
        </label>

        <div class="cards-list">
          ${cards.map(
            (card, i) => html`
              <div class="card-row" key=${i}>
                <input
                  type="text"
                  placeholder="Vorderseite"
                  value=${card.front}
                  onChange=${(e) => updateCard(i, 'front', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Rückseite"
                  value=${card.back}
                  onChange=${(e) => updateCard(i, 'back', e.target.value)}
                />
                <button type="button" class="swap-btn" title="Vorder- und Rückseite tauschen" onClick=${() => swapCard(i)}>
                  ⇄
                </button>
                <button type="button" class="remove-btn" onClick=${() => removeCardRow(i)}>
                  ✕
                </button>
              </div>
            `
          )}
        </div>

        <button type="submit" disabled=${saving}>
          ${saving ? 'Wird gespeichert…' : `Stapel mit ${cards.length} Karten speichern`}
        </button>

        <p class="hint"><a href="#/add">Zurück zum Scannen</a></p>
      </form>
    </div>
  `
}
