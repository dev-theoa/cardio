import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase.js'
import { useAuth } from '../lib/AuthContext.js'
import { navigate } from '../lib/router.js'
import { setPendingCards } from '../lib/importStore.js'
import { ColumnCropper } from '../components/ColumnCropper.js'
import { html } from '../lib/html.js'

function emptyCard() {
  return { front: '', back: '' }
}

export function AddVocabularyPage() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [cards, setCards] = useState([emptyCard(), emptyCard()])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [cropperFile, setCropperFile] = useState(null)

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

  function addCardRow() {
    setCards((prev) => [...prev, emptyCard()])
  }

  function removeCardRow(index) {
    setCards((prev) => prev.filter((_, i) => i !== index))
  }

  function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // damit man dieselbe Datei erneut auswählen kann
    if (!file) return
    setCropperFile(file)
  }

  function handleCropConfirm(detectedCards) {
    setCropperFile(null)
    setPendingCards(detectedCards)
    navigate('/review')
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
      setError('Bitte füge mindestens eine vollständige Karte hinzu (Vorder- und Rückseite).')
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
      <div class="stack-form">
        <h1>Vokabeln hinzufügen</h1>

        <div class="scan-box">
          <label class="scan-label">
            📷 Vokabeln aus Foto scannen
            <input type="file" accept="image/*" capture="environment" onChange=${handleFileSelected} hidden />
          </label>
        </div>

        <p class="divider">— oder manuell eintragen —</p>

        <form onSubmit=${handleSubmit}>
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
                  ${cards.length > 1 &&
                  html`
                    <button type="button" class="remove-btn" onClick=${() => removeCardRow(i)}>
                      ✕
                    </button>
                  `}
                </div>
              `
            )}
          </div>

          <button type="button" class="secondary-btn" onClick=${addCardRow}>
            + Weitere Karte
          </button>

          <button type="submit" disabled=${saving}>
            ${saving ? 'Wird gespeichert…' : 'Stapel speichern'}
          </button>
        </form>

        <p class="hint"><a href="#/">Zurück zur Übersicht</a></p>
      </div>
    </div>

    ${cropperFile &&
    html`<${ColumnCropper} file=${cropperFile} onCancel=${() => setCropperFile(null)} onConfirm=${handleCropConfirm} />`}
  `
}
